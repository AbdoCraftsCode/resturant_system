import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true, trim: true }, // 🏷️ اسم الفرع بالإنجليزية
        ar: { type: String, required: true, trim: true }  // 🏷️ اسم الفرع بالعربية
    },
    address: {
        en: { type: String, required: true, trim: true }, // 🏠 العنوان بالإنجليزية
        ar: { type: String, required: true, trim: true }  // 🏠 العنوان بالعربية
    },
    locationLink: {
        type: String,
        required: false, // 🌍 رابط الموقع (يمكن تركه فارغًا)
        trim: true
    }
}, { timestamps: true });

export const BranchModel = mongoose.model("Branch", branchSchema);
