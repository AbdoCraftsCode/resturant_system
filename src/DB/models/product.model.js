

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name1: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        name2: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        country: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        newprice: { type: Number, required: true },
        oldprice: { type: Number, required: true },
        description: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        quantity: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        image:[{
            secure_url: { type: String },
            public_id: { type: String },
        }],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }


    },
    { timestamps: true }
);

export const ProductModel = mongoose.model("Product", productSchema);




