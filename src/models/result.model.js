import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,   
        required: true
    },
    grade: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Result = mongoose.model('Result', resultSchema);

export default Result;