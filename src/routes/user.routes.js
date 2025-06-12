const express = require("express");
const { register, login, logout, refreshAccessToken, getCurrentUser, changePassword, updateUserDetails } = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();


router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// middleware :- protected routes
router.post("/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    register
);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getCurrentUser);
router.put("/change-password", verifyToken, changePassword);
router.put(
    "/update",
    upload.fields(
        [
            { name: "avatar", maxCount: 1 },
            { name: "coverImage", maxCount: 1 }
        ]
    ),
    updateUserDetails
);


module.exports = router;
