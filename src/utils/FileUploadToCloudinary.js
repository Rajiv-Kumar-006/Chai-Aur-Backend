const cloudinary = require('cloudinary').v2
const fs = require("fs")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null
        // upload File...
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            }
        )

        // file upload successfully...
        console.log("file is upload on cloudinary : ", response.url)
        return response

    } catch (error) {

        // remove the  loacal save temporary file as the upload opration get failed...
        fs.unlinkSync(localFilePath)
        return null

    }
}