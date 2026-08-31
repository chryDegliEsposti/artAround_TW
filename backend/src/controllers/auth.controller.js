const mongoose = require('mongoose');
const User = require('../models/User');
const Museum = require('../models/Museum');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'artaround_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signup = async (req, res, next) => {
    try {
        console.log(`[Auth] INCOMING SIGNUP REQUEST:`, req.body);
        const { email, username, password, role, museumId } = req.body;

        if (!email || !username || !password) {
            const error = new Error('Tutti i campi obbligatori (email, username, password) devono essere compilati.');
            error.status = 400;
            throw error;
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const userRole = role || 'visitor';

        // Check uniqueness
        let alreadyExists = await User.findOne({ email: cleanEmail });
        if (alreadyExists) {
            const error = new Error('Un utente con questa EMAIL esiste già!');
            error.status = 409;
            throw error;
        }

        alreadyExists = await User.findOne({ username: cleanUsername });
        if (alreadyExists) {
            const error = new Error('Un utente con questo USERNAME esiste già!');
            error.status = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserData = {
            email: cleanEmail,
            username: cleanUsername,
            password: hashedPassword,
            role: userRole,
            managedMuseums: []
        };

        if (userRole === 'creator' && museumId) {
            const cleanMuseumId = museumId.trim().toUpperCase();
            newUserData.museumId = cleanMuseumId;

            // Link existing museum if already present in DB
            const existingMuseum = await Museum.findOne({ museumId: cleanMuseumId });
            if (existingMuseum) {
                newUserData.managedMuseums.push(existingMuseum._id);
            }
        }

        const newUser = await User.create(newUserData);

        if (userRole === 'creator' && newUserData.managedMuseums.length > 0) {
            await Museum.updateMany(
                { _id: { $in: newUserData.managedMuseums } },
                { $addToSet: { collaborators: newUser._id } }
            );
        }

        const userToken = jwt.sign(
            { 
                userId: newUser._id,
                email: newUser.email, 
                role: newUser.role 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie('jwt', userToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userData = {
            id: newUser._id,
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            museumId: newUser.museumId,
            managedMuseums: newUser.managedMuseums
        };

        res.status(201).json({
            success: true,
            message: 'Registrazione completata con successo!',
            data: {
                token: userToken,
                user: userData
            }
        });

    } catch (error) {
        next(error);
    }    
};

const login = async (req, res, next) => {
    try {
        console.log(`[Auth] INCOMING LOGIN REQUEST:`, req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Inserisci sia email che password.');
            error.status = 400;
            throw error;
        }

        const cleanLogin = email.trim().toLowerCase();

        // Allow login by email or username
        const user = await User.findOne({
            $or: [
                { email: cleanLogin },
                { username: email.trim() }
            ]
        });

        if (!user) {
            const error = new Error('Credenziali non valide (email o password errata).');
            error.status = 401;
            throw error;
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            const error = new Error('Credenziali non valide (email o password errata).');
            error.status = 401;
            throw error;
        }

        const userToken = jwt.sign( 
            { userId: user._id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie('jwt', userToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userData = {
            id: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            museumId: user.museumId,
            managedMuseums: user.managedMuseums,
            purchasedVisits: user.purchasedVisits,
            purchasedItems: user.purchasedItems
        };
        
        res.status(200).json({
            success: true,
            message: 'Login effettuato con successo',
            data: {
                token: userToken,
                user: userData
            }
        });

    } catch (error) {
        next(error);
    }   
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utente non trovato' });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                museumId: user.museumId,
                managedMuseums: user.managedMuseums,
                purchasedVisits: user.purchasedVisits,
                purchasedItems: user.purchasedItems
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Errore interno del server' });
    }
};

const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

module.exports = {
    signup,
    login,
    getMe,
    logout,
};