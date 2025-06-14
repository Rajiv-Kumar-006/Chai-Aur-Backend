const User = require("../models/user.model");
const uploadOnCloudinary = require("../utils/FileUploadToCloudinary");
const jwt = require("jsonwebtoken");
require("dotenv").config()

// token generate function
const generateAccessAndRefreshToken = async (userId) => {
    try {

        // console.log("userID", userId)
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        console.error("Error during generating the token:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating refresh and access token.",
        });
    }
}

// Register new user
exports.register = async (req, res) => {
    try {
        // Fetch data from frontend
        const { fullName, email, userName, password } = req.body;

        // Validate required fields
        if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if user already exists
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Get file paths for avatar and cover image
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        console.log(avatarLocalPath)
        let coverImageLocalPath;

        if (req.files && Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // Validate avatar file
        if (!avatarLocalPath) {
            return res.status(400).json({
                success: false,
                message: "Avatar file is required",
            });
        }

        // Upload files to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar?.url) {
            return res.status(400).json({
                success: false,
                message: "Failed to upload avatar",
            });
        }

        // Create user in database
        const createdUser = await User.create({
            fullName,
            userName: userName.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        });

        // Fetch user details excluding sensitive fields
        const userDetails = await User.findById(createdUser._id).select("-password -refreshToken");

        if (!userDetails) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong while registering the user",
            });
        }

        // Send success response
        return res.status(200).json({
            success: true,
            userDetails,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({
            success: false,
            message: "Server failure",
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {

        // 1. fetch the data from frontend 
        const { email, password } = req.body

        // 2. validate the empty field
        if (!email || !password) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Email and Password are required."
                })
        }

        // 3. find the user
        const user = await User.findOne({ email })
        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User does not exist."
                })
        }

        // 4. compare the password 
        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid credentials"
                })
        }

        // 5. generate the Access and Refresh token 
        let accessToken, refreshToken;

        try {
            ({ accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id));
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            return res.status(500).json({
                success: false,
                message: "Token generation failed",
            });
        }

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        // 6. send the cookie
        const option = {
            httpOnly: true,
            secure: true,
        }

        // 7. send the success response 
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json({
                success: true,
                user: loggedInUser, accessToken, refreshToken,
                message: "User logged in successfully",
            });
    } catch (error) {
        console.error("Error during login:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: "Server failure.",
            });
    }
};

// logout
exports.logout = async (req, res) => {
    try {

        // 1. update the refress token as undefined
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    "refreshToken": undefined
                }
            },
            {
                new: true
            }
        )

        // 2. clear the cookies
        const option = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .json({
                success: true,
                message: "User logged out successfully",
            });


    } catch (error) {
        console.error("Error during logout:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: "Server failure.",
            });
    }
}

// refresh Access token
exports.refreshAccessToken = async (req, res) => {
    try {

        // 1. Get refresh token from body or cookies
        const incomingRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

        // 2. Check if refresh token exists
        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token is required",
            });
        }

        // 3. Verify refresh token
        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }

        // 4. Find user and check token match
        const user = await User.findById(decodedToken._id);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - token mismatch",
            });
        }

        // 5. Generate new tokens
        let accessToken, refreshToken;
        try {
            ({ accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id));
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            return res.status(500).json({
                success: false,
                message: "Token generation failed",
            });
        }

        // 6. Send tokens in HTTP-only cookies
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        };

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        // 7. Send response
        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error("Error in refreshing token:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while refreshing the token",
        });
    }
};

// change password 
exports.changePassword = async (req, res) => {
    try {

        // 1. assume the user is authenticate via middelware
        const userId = req.user._id

        // 2. fetch the data
        const { oldPassword, newPassword, confirmPassword } = req.body

        // 3. validate the input 
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "All field required. "
                })
        }

        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "New password do not match "
                })
        }

        // 4. find the user 
        const user = await User.findById(userId)

        // 5. verify the old password and new password
        const isPasswordCorrect = await user.isPasswordCorrect(newPassword)

        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Old password do not match "
                })
        }

        // 6. update the password
        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        // 7. return the success response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// get the data of current user
exports.getCurrentUser = async (req, res) => {
    try {

        // 1. assume the user is authenticate via middelware
        const userId = req.user._id

        // 2. find the user
        const user = await User.findById(userId).select("-password -refreshToken")

        if (!user) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: "User not found."
                })
        }

        // 3. success response
        return res
            .status(200)
            .json({
                success: true,
                user,
                message: "user data fetch successfully."
            })

    } catch (error) {
        console.error("Error fetching current user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// update the user details
exports.updateUserDetails = async (req, res) => {
    try {

        // 1. assume the user is authenticate via middelware
        const userId = req.user._id

        // 2. fetch the data
        const { fullName, userName } = req.body

        // 3. collection of updated details
        const updates = {}

        if (fullName) updates.fullName = fullName
        if (userName) updates.userName = userName.toLowerCase()

        // 4. handle the update avatar
        const avatarLocalPath = req.files?.avatar?.[0].path;

        if (avatarLocalPath) {
            const avatarUpload = await uploadOnCloudinary(avatarLocalPath)

            if (!avatarLocalPath) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Failed to update the avatar."
                    })
            }

            updates.avatar = avatarUpload.url;
        }

        // 5. handle the cover Image update
        const coverImageLocalPath = req.files?.avatar?.[0].path;

        if (coverImageLocalPath) {
            const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath)

            if (coverImageUpload) {
                updates.coverImage = coverImageUpload.url;
            }

        }

        // 6. update in db
        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true },
        ).select("-password -refreshToken")

        // 7. return success response
        return res
            .status(200)
            .json({
                success: true,
                updated,
                message: " User details updated successfully"
            })

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating user",
        });
    }
};