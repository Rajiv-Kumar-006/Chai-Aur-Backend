const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {

        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("subscription", subscriptionSchema);
