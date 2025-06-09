const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: [true, "Video file is required"],
            trim: true,
        },
        thumbnail: {
            type: String,
            required: [true, "Thumbnail is required"],
            trim: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Video", videoSchema);
