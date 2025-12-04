import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    note: {
        type: String,
        default: ""
    },

    profileImage: {
        secure_url: { type: String },
        public_id: { type: String }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Taskkk = mongoose.model("Taskkk", taskSchema);
