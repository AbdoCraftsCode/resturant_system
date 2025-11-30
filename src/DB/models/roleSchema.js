// models/Role.model.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }
    ],
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const RoleModel = mongoose.model("Role", roleSchema);
