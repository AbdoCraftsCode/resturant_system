import mongoose from "mongoose";

const mixSchema = new mongoose.Schema({
    Mostawdaa: { type: mongoose.Types.ObjectId, ref: "Mostawdaa", default: null },
    Product: { type: mongoose.Types.ObjectId, ref: "Product", default: null },
    newprice: { type: Number, },
    oldprice: { type: Number, },
    quantity: {
        en: { type: String, required: true, trim: true },
        ar: { type: String, required: true, trim: true }
    },

}, { timestamps: true });

export const mixModel = mongoose.model("Mix", mixSchema);
