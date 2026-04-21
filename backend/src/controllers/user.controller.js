const User = require('../models/User');
const mongoose = require('mongoose');


const getUserProfile = async (req, res, next) => {
    try {
        const user = req.user;
        //const user = await User.findById(userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //dati per frontend dashboard...
        const username = user.username;
        const email = user.email;
        const favorites = user.favorites || [];
        const profileData = {
            username,
            email,
            favorites,
        };

        res.status(200).json(profileData);

    } catch (error) {
        next(error);    
    }
};

const updateUserProfile = async (req, res, next) => { //da testare: vedi se funziona update su db(quando finito frontend relativo)
    try {
        const userId = req.user._id; // From authorization middleware
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        res.status(200).json(updatedUser);

    } catch (error) {
        next(error);
    }
};

//....

module.exports = {
    getUserProfile,
    updateUserProfile,

};