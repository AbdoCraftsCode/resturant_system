// models/Question.model.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        ar: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true }
    },

    mainGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "MainGroup",
        required: true
    }],

    subGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubGroup",
        required: true
    }],

    evaluation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evaluation",
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const QuestionModel = mongoose.model("Question", questionSchema);
