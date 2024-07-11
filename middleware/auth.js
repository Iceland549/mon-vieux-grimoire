const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
    console.log('Auth middleware called');
   try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
        throw new Error('Authorization header is missing');
        }
       const token = req.headers.authorization.split(' ')[1];
       console.log('Token received:', token);
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       console.log('Decoded userId:', userId); 
       req.auth = {
           userId: decodedToken.userId
       };
	next();
   } catch(error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: error.message || 'Requête non authentifiée' });
    }
};