const express = require('express');
const expenseController = require('../controllers/expenseController');
const router = express.Router();

router.post('/', expenseController.createExpense);
router.get('/user/:userId', expenseController.getUserExpenses);
router.get('/balancesheet', expenseController.getBalanceSheet);
router.post('/pay', expenseController.payDebt);

module.exports = router;
