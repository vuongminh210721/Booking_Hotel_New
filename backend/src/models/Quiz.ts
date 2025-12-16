import mongoose, { Document, Schema } from "mongoose";

// models/Quiz.ts
export interface IQuiz extends Document {
    quizId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    rewardPoints: number;
    isActive: boolean;
}

const QuizSchema: Schema = new Schema({
    quizId: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    rewardPoints: { type: Number, default: 200 },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model<IQuiz>("Quiz", QuizSchema);