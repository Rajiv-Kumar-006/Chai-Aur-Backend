const express = require("express");
const { register, login } = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware"); // ✅ CommonJS import

const router = express.Router();

router.post("/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    register
);


router.post("/login", login);

module.exports = router;
