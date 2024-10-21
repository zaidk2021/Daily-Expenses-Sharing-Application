const Expense = require('../models/expenseModel');

// Add a new expense
exports.createExpense = async (req, res) => {
    try {
        const { amount, method, userId, participants } = req.body;
        if (method === 'percentage') {
            const totalPercentage = participants.reduce((acc, p) => acc + p.share, 0);
            if (totalPercentage !== 100) {
                return res.status(400).json({ message: 'Total percentage must equal 100' });
            }
        }
        const expense = new Expense({ amount, method, userId, participants });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all expenses for a user
exports.getUserExpenses = async (req, res) => {
    const { userId } = req.params;
    
    try {
        // Find expenses where the user is the payer or participant
        const userExpenses = await Expense.find({
            $or: [
                { userId: userId },  // The user created the expense
                { "participants.userId": userId }  // The user is a participant in the expense
            ]
        }).populate('participants.userId');

        res.status(200).json(userExpenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get balance sheet
const { Parser } = require('json2csv');

// Get balance sheet and download as CSV
exports.getBalanceSheet = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('participants.userId');
        
        let balanceSheet = {};

        // Calculate what each user owes or is owed
        expenses.forEach(expense => {
            const totalAmount = expense.amount;  // The total amount for the expense

            expense.participants.forEach(participant => {
                const user = participant.userId.name;

                // Initialize the user's entry in the balance sheet if not already present
                if (!balanceSheet[user]) {
                    balanceSheet[user] = {
                        totalPaid: 0,
                        totalOwed: 0
                    };
                }

                // Calculate the owed amount based on the method
                let owedAmount = 0;
                if (expense.method === 'percentage') {
                    // Convert the percentage share into an actual amount
                    owedAmount = (participant.share / 100) * totalAmount;
                } else {
                    // For "equal" and "exact", the share is already the owed amount
                    owedAmount = participant.share;
                }

                // Update the balance sheet with the owed amount
                balanceSheet[user].totalOwed += owedAmount;

                // If the user is the payer (i.e., they created the expense), update the total paid
                if (expense.userId.name === user) {
                    balanceSheet[user].totalPaid += totalAmount;  // Payer's total payment
                }
            });
        });

        // Check for paid debts and adjust the balance sheet accordingly
        const payments = await Expense.find({
            "participants.userId": { $exists: true }
        }).populate('participants.userId');

        payments.forEach(payment => {
            payment.participants.forEach(participant => {
                const payerName = participant.userId.name;

                // If a payment has been made, reduce the corresponding "totalOwed" amount
                if (balanceSheet[payerName]) {
                    let paidAmount = 0;
                    if (payment.method === 'percentage') {
                        paidAmount = (participant.share / 100) * payment.amount;
                    } else {
                        paidAmount = participant.share;
                    }
                    balanceSheet[payerName].totalOwed -= paidAmount;
                    
                    // Ensure the owed amount doesn't go below zero
                    if (balanceSheet[payerName].totalOwed < 0) {
                        balanceSheet[payerName].totalOwed = 0;
                    }
                }
            });
        });

        // Convert balance sheet to CSV if needed
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(Object.keys(balanceSheet).map(user => ({
            user,
            totalPaid: balanceSheet[user].totalPaid,
            totalOwed: balanceSheet[user].totalOwed
        })));

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment('balance-sheet.csv');  // Name of the downloaded file
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Pay off a debt
exports.payDebt = async (req, res) => {
    const { payerId, payeeId, amount } = req.body;

    try {
        // Find all expenses where the payer owes money to the payee
        const expenses = await Expense.find({
            "participants.userId": payerId,
            userId: payeeId
        });

        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ message: "No debts found between these users" });
        }

        // Loop through the expenses and reduce the owed amounts or percentages
        expenses.forEach(expense => {
            const totalAmount = expense.amount;  // Total amount of the expense

            expense.participants.forEach(participant => {
                if (participant.userId.toString() === payerId) {
                    // Check if the expense is percentage-based or exact amount-based
                    if (expense.method === 'percentage') {
                        // Convert the percentage share into an actual owed amount
                        let owedAmount = (participant.share / 100) * totalAmount;

                        // Subtract the payment from the owed amount
                        owedAmount -= amount;
                        
                        // If the amount left is less than zero, set it to zero
                        if (owedAmount < 0) owedAmount = 0;

                        // Recalculate the percentage based on the remaining amount
                        participant.share = (owedAmount / totalAmount) * 100;

                    } else if (expense.method === 'exact' || expense.method === 'equal') {
                        // For exact or equal splits, directly subtract the payment from the share
                        participant.share -= amount;

                        // Ensure the share does not go negative
                        if (participant.share < 0) participant.share = 0;
                    }
                }
            });

            // Save the updated expense
            expense.save();
        });

        res.status(200).json({ message: "Debt paid successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
