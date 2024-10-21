const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    method: { type: String, enum: ['equal', 'exact', 'percentage'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            share: { type: Number, required: true },
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
