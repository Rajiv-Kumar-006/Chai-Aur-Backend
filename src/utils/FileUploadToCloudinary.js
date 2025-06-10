const cloudinary = require('cloudinary').v2;
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // 1. Upload the file to the specific folder in Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "chaiAurBackend",
    });

    console.log("✅ Uploaded to Cloudinary:", response.secure_url);

    // 2. Delete local file after successful upload
    fs.unlinkSync(localFilePath);
    console.log("🗑️ Deleted local file:", localFilePath);

    return response;

  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);

    // Clean up even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("🗑️ Deleted failed upload local file:", localFilePath);
    }

    return null;
  }
};

module.exports = uploadOnCloudinary;
