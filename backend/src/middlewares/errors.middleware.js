const errorsMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message;    
        
        console.error(err); //for debugging

        //Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = `Resource with id not found: ${err.value}.`;
            error = new Error(message);
            error.statusCode = 404;
        }

        //Mongoose duplicate key
        if (err.code === 11000) {
            const message = `Duplicate field value: ${Object.keys(err.keyValue)}.`;
            error = new Error(message);
            error.statusCode = 400;
        }

        //Mongoose validation error (wrong props passed to model)
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = new Error(message);
            error.statusCode = 400;
        }

        res.status(error.statusCode || 500).json({success: false, error: error.message || 'Server Error'});

    }catch (err) { 
        next(err);
        /*
        ------------ se serve ---------------
        //if error occurs inside the error middleware itself
        console.error('CRITICAL: Error middleware failed:', innerErr);
        
        // Fallback: risposta minimale
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
        */

    }
}

module.exports = errorsMiddleware;