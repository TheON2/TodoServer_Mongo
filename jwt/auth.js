const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

function auth(req, res, next) {
  // console.log(req)
  const token = req.cookies.token
  console.log(token)
  if (!token) return res.status(501).send('Access denied. No token provided.');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    req.user = decoded;
    next();
  } catch (ex) {
    res.cookie('token', '', { expires: new Date(0) });
    res.status(502).send('Invalid token.');
  }
}

module.exports = auth;
