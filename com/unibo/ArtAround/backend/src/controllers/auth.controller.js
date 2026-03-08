const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
    // Logica di registrazione
    console.log(`INCOMING SIGNUP REQUEST}`);
    const session = await mongoose.startSession();
    session.startTransaction(); //per assicurare operazioni atomiche su state db 
    try {
        const {email, username, password, role, museumId} = req.body;
        
        //check uniqueness
        let alreadyExists = await User.findOne({email});
        if(alreadyExists){
            const error = new Error('User with this EMAIL already exists!');
            error.status = 409;
            throw error;
        }
        alreadyExists = await User.findOne({username});
        if(alreadyExists){
            const error = new Error('User with this USERNAME already exists!');
            error.status = 409;
            throw error;
        }

        //create the new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserData = {
                email: email,
                username: username,
                password: hashedPassword,
                role: role
        }
        if(role === 'creator'){
            newUserData.museumId = museumId;
        }
            
        const newUsers = await User.create([ //note: .create returns arr of created models
            newUserData
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

        //"hybrid approach" for jwt management
        res.cookie('jwt', userToken, {
            httpOnly: true,      //cookie sicuro(no js access)
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const userData = {
            id: newUsers[0]._id,
            username: newUsers[0].username,
            role: newUsers[0].role
        }
        if(newUsers[0].role === 'creator'){
            userData.museumId = newUsers[0].museumId;
        }

        res.status(201).json({
            success: true,
            message: 'Registration was successful!',
            data: {
                token: userToken,
                user: userData
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
    console.log(`INCOMING LOGIN REQUEST`, req.cookies);
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

        const userToken = jwt.sign( 
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.cookie('jwt', userToken, {
            httpOnly: true,      //cookie sicuro(no js access)
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const userData = {
            id: user._id,
            username: user.username,
            role: user.role
        }
        if(user.role === 'creator'){
            userData.museumId = user.museumId;
        }
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: userToken,
                user: userData
            }
        });

    }catch (error) {
        next(error); //err handling middleware
    }   
}

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
}

module.exports = {
    signup,
    login,
    logout,
}