const User = require("../models/user.model")
const uploadOnCloudinary = require("../utils/FileUploadToCloudinary")


exports.register = async (req, res) => {

    try {

        // fetch data from frontend...
        const { fullName, email, userName, password } = req.body

        // validation - empty field...
        if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "All fields are required..."
            })
        }

        // check the user is exist already or not..
        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists..."
            })
        }

        // check image for avatar...
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        if (!avatarLocalPath) {
            return res.status(400).json({
                success: false,
                message: "Avatar file is required..."
            })
        }

        // upload the coverImage and Avatar on cloudinary... 
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar?.url) {
            return res.status(400).json({
                success: false,
                message: "Failed to upload avatar..."
            })
        }


        // create entry for data in DATABASE...
        const createdUser = await User.create({
            fullName,
            userName: userName.toLowerCase(),
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""

        })

        const userDetails = await User.findById(createdUser._id).select(
            "-password -refreshToken"
        )

        if (!userDetails) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong while registering the user..."
            })
        }


        // success response...
        return res.status(200).json({
            success: true,
            userDetails,
            message: "User register successfully..."
        })

    } catch (error) {
        console.log("Error :", error)
        return res.status(500).json({
            success: false,
            message: "Server Failure..."
        })
    }

}

exports.login = async (req, res) => {

    try {

        res.status(200).json({
            success: true,
            message: "User login successfully..."
        })

    } catch (error) {
        console.log("Error :", error)
        res.status(500).json({
            success: false,
            message: "Server Failure..."
        })
    }

}