const { register } = require("../controllers/user.controller")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

exports.verifyToken = async (req, res, next) => {
    try {

        // 1. fetch the token 
        const authHeader = req.header("Authorization");
        const token = req.cookies?.accessToken
            || (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null);
        console.log("Token :- ", token)

        // 2. validation :- token
        if (!token) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Unauthorized request..."
                })
        }

        // 3. verify the token 
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded : ", decoded)

        // 4. DB call 
        const user = await User.findById(decoded._id).select("-password -refreshToken")
        console.log("user from veriftToken : ", user)
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Not able to find the user..."
                })
        }

        // 5. attach the user info with req
        req.user = user;
        next()

    } catch (error) {
        console.error("Error during verifyToken :", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired. Please login again.",
            });
        }

        return res
            .status(500)
            .json({
                success: false,
                message: "Server failure",
            });
    }
}