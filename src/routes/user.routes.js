const express = require("express");
const { register, login, logout, refreshAccessToken } = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    register
);
router.post("/login", login)
router.post("/logout", verifyToken, logout);
router.post("/refresh-token", refreshAccessToken)

module.exports = router;
