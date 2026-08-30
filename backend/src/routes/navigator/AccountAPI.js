const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require('../../models/User');
const authorization = require('../../middlewares/auth.middleware');

// GET /api/v1/navigator/account/me
router.get('/me', authorization, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('purchasedVisits')
            .populate('purchasedItems')
            .select('-password'); // Exclude password hash

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utente non trovato' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error("Account me error:", err);
        res.status(500).json({ success: false, message: 'Errore interno del server' });
    }
});

// PUT /api/v1/navigator/account/update-password
router.put('/update-password', authorization, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Campi mancanti' });
        }

        const user = await User.findById(req.userId);
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'La password corrente è errata.' });
        }

        // Hash and update new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password aggiornata con successo.' });
    } catch (err) {
        console.error("Update password error:", err);
        res.status(500).json({ success: false, message: 'Errore durante aggiornamento password.' });
    }
});

// PUT /api/v1/navigator/account/update-payment
router.put('/update-payment', authorization, async (req, res) => {
    try {
        const { payment_card_number, payment_card_cvv, payment_card_exp } = req.body;
        
        const user = await User.findById(req.userId);
        
        if (payment_card_number) user.payment_card_number = payment_card_number;
        if (payment_card_cvv) user.payment_card_cvv = payment_card_cvv;
        if (payment_card_exp) user.payment_card_exp = payment_card_exp;

        await user.save();

        res.json({ success: true, message: 'Metodo di pagamento aggiornato.' });
    } catch (err) {
        console.error("Update payment error:", err);
        res.status(500).json({ success: false, message: 'Errore durante aggiornamento pagamento.' });
    }
});

module.exports = router;
