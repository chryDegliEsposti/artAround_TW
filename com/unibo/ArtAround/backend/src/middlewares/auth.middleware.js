const jwt = require('jsonwebtoken');
const User = require('../models/User');

//TO filter requests based on JWT token presence and validity -> route protected
const authorization = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(authHeader || authHeader.startsWith('Bearer ')){
            const token = authHeader.split(' ')[1]; //Bearer <token>
            if(!token){
                return res.sendStatus(401).json({message: 'Not authorized'});
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;            
            const user = await User.findById(userId);
            if(!user){
                return res.sendStatus(401).json({message: 'Not authorized'});
            }

            const requestedUserId = req.params.userId || req.body.userId; 
            if(requestedUserId !== userId){
                return res.sendStatus(403).json({message: 'Forbidden: Access is denied'});
            }

            req.user = user; //go on to next middleware/controller(now will have user data)
            next();
        }

        res.sendStatus(401).json({message: 'Not authorized'});

    }catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({message: 'Token expired'});
        }

        res.status(401).json({message: 'Not authorized', error: error.message});
    }
}

module.exports = authorization;