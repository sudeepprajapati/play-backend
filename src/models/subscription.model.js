const { Schema, model } = require("mongoose");

const subscriptionSchema = new Schema({
    Subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    Channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true })

const Subscription = model("Subscription", subscriptionSchema)