const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error('Authorization header missing!');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        req.auth = { userId: userId };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid request!' });
    }
};
