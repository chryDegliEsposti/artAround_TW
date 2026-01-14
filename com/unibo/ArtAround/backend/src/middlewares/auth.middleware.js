const jwt = require('jsonwebtoken');
const User = require('../models/User');

//TO filter requests based on JWT token presence and validity -> route protected
const authorization = async (req, res, next) => {
    try {
        //check for jwt in:
        let token = null;

        //1. Authorization header(JS fetch call case)
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        //2. Http-only Cookie(normal browser req case)
        else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if(!token){
            return handleNoToken(req, res)
        }

        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;            
        const user = await User.findById(userId);
        if(!user){
            res.clearCookie('jwt');
            return handleInvalidUser(req, res);
        }

        //go to next middleware/controller(the backend now will know who the user is)
        req.user = user; 
        req.userId = decoded.userId;
        req.token = token;

        next();

    }catch (error) {
        handleTokenError(error, req, res)
    }

}


// Funzioni ausiliarie(per decidere tipo e che response dare a browser/funzione JS)
function isApiRequest(req) {
    return req.originalUrl.startsWith('/api/')
}

function handleTokenError(error, req, res) {
    res.clearCookie('token')
    
    if (error.name === 'TokenExpiredError') {
        if (isApiRequest(req)) {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            })
        }
        return res.redirect('/marketplace/login?error=token_expired');
    }
    
    if (isApiRequest(req)) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    return res.redirect('/marketplace/login?error=invalid_token');
}

function handleNoToken(req, res) {
    if (isApiRequest(req)) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    return res.redirect('/marketplace/login?error=no_token');
}

function handleInvalidUser(req, res) {
    if (isApiRequest(req)) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    }
    return res.redirect('/marketplace/login?error=user_not_found');
}



module.exports = authorization;