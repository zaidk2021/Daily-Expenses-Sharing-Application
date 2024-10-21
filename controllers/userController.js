const User = require('../models/userModel');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, mobile } = req.body;
        const user = new User({ name, email, mobile });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get user details
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
