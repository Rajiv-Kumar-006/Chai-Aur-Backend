const User = require("../models/user.model");
const uploadOnCloudinary = require("../utils/FileUploadToCloudinary");

// Register a new user
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
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            message: "Server failure",
        });
    }
};

