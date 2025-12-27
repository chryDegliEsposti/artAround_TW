const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
    // Logica di registrazione
    console.log(req)
    const session = await mongoose.startSession();
    session.startTransaction(); //per assicurare operazioni atomiche su state db 
    try {
        const {email, username, password, role} = req.body;

        const alreadyExists = await User.findOne({email});
        if(alreadyExists){
            const error = new Error('User with this email already exists!');
            error.status = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([ //note: .create returns arr of created models
            {
                email,
                username,
                password: hashedPassword,
                role: role || 'visitor'
            }
        ], { session }); //bind session to new user creation

        const userToken = jwt.sign({ 
                userId: newUsers[0]._id,
                email: newUsers[0].email, 
                role: newUsers[0].role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await session.commitTransaction(); //se tutto ok, conferma le operazioni
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token: userToken,
                user: newUsers[0]
            }
        });

    }catch (error) {
        await session.abortTransaction(); //in caso di errore, annulla le operazioni
        session.endSession();
        next(error); //passa l'errore al middleware di gestione errori
    }    
}

const login = async (req, res, next) => {
    // Logica di login
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.status = 401;
            throw error;
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            const error = new Error('Invalid email or password');
            error.status = 401;
            throw error;
        }

        const userToken = jwt.sign( //...?? vecchio token signup che senso aveva?
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: userToken,
                user: user
            }
        });

    }catch (error) {
        next(error); //err handling middleware
    }   
}


module.exports = {
    signup,
    login,

}