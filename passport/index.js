const passport = require("passport");
const local = require("./local");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user.email);
  });
  passport.deserializeUser(async (email, done) => {
    try {
      const user = await User.findOne({ email:email });
      done(null, user);
    } catch (error) {
      console.error(error);
      done(error);
    }
  });
  local();
};