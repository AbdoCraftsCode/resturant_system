import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",  // موظف موجود في جدول الـ Users
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        fromTime: {
            type: Date,
            required: true
        },

        toTime: {
            type: Date,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",  // الشخص الذي أضاف المهمة
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }  // timestamps يعطي createdAt و updatedAt تلقائيًا
);

export const TaskModel = mongoose.model("Task", taskSchema);
