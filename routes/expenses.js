const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').isIn(['Food', 'Transport', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Others']).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { description, amount, category, date } = req.body;

    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses for logged-in user with filtering
// @access  Private
router.get('/', auth, [
  query('category').optional().isIn(['Food', 'Transport', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Others']).withMessage('Invalid category'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { category, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    
    if (category) {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:expenseId
// @desc    Delete specific expense
// @access  Private
router.delete('/:expenseId', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.expenseId);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/summary
// @desc    Get expense summary using MongoDB aggregation
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Calculate total spending
    const totalSpending = await Expense.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Format summary for easy frontend consumption
    const categoryTotals = {};
    summary.forEach(item => {
      categoryTotals[item._id] = item.total;
    });

    res.json({
      success: true,
      summary: {
        categoryTotals,
        categoryBreakdown: summary,
        totalSpending: totalSpending.length > 0 ? totalSpending[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;