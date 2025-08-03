import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    subGroupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubGroup",
        required: true,
    },
    answer: {
        type: String,
        enum: ["yes", "no"],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

const evaluationResultSchema = new mongoose.Schema({
    modeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mode",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    answers: [answerSchema],
}, { timestamps: true });

export default mongoose.model("EvaluationResult", evaluationResultSchema);
