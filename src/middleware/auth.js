const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const masterOnly = (req, res, next) => {
  if (!req.user || !req.user.isMaster) {
    return res.status(403).json({ error: 'Access denied. Master admin only.' });
  }
  next();
};

module.exports = { auth, masterOnly };
