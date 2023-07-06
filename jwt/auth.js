const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

function auth(req, res, next) {
  // console.log(req)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(501).send('Access denied. No token provided.');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    //res.cookie('token', '', { expires: new Date(0), httpOnly: true, sameSite: 'None', secure: true });
    res.status(502).send('Invalid token.');
  }
}

module.exports = auth;
