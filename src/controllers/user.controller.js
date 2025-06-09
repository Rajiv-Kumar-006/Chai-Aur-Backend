const User = require("../models/user.model")


exports.register = async (req, res) => {

    try {

        return res.status(200).json({
            success: true,
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