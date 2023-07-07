const bcrypt = require('bcrypt')
const {isNotLoggedIn, isLoggedIn} = require("./middlewares");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const auth = require("../jwt/auth");
const refreshauth = require("../jwt/refreshauth");
const dotenv = require("dotenv");

dotenv.config();

module.exports = function(app, User)
{
  app.get('/user/kakao', passport.authenticate('kakao', { authType: 'reprompt' }));

  app.get('/user/kakao/callback', function(req, res, next) {
    passport.authenticate('kakao', async function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
      try {
        console.log('몽고유저 조회함 카카오:',user)
        let mongoUser = await User.findOne({ email: user._json.kakao_account.email });
        if (!mongoUser) {
          mongoUser = new User({
            email: user._json.kakao_account.email,
            nickName:user._json.properties.nickname,
            password:user._json.kakao_account.email,
            method:'kakao',
            profileUrl:user._json.properties.thumbnail_image,
            profileContent:'카카오로 회원가입 하였습니다.',
          });
          await mongoUser.save();
        }
        console.log('몽고유저 생성됨 카카오:',mongoUser)
        const refreshPayload = {
          email: mongoUser.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 1), // Refresh token valid for 1 days
        };
        const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        return res.redirect(`${process.env.ORIGIN}/`);
      } catch (error) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
    })(req, res, next);
  });

  app.get('/user/naver', passport.authenticate('naver', { authType: 'reprompt' }));

  app.get('/user/naver/callback', function(req, res, next) {
    passport.authenticate('naver', async function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
      try {
        console.log('몽고유저 조회함 네이버:',user)
        let mongoUser = await User.findOne({ email: user.email });
        if (!mongoUser) {
          mongoUser = new User({
            email: user.email,
            nickName:user.nickname,
            password:user.email,
            method:'naver',
            profileUrl:user.profileImage,
            profileContent:'네이버로 회원가입 하였습니다.',
          });
          await mongoUser.save();
        }
        console.log('몽고유저 생성됨 네이버:',mongoUser)
        const refreshPayload = {
          email: mongoUser.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 1), // Refresh token valid for 1 days
        };
        const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        return res.redirect(`${process.env.ORIGIN}/`);
      } catch (error) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
    })(req, res, next);
  });
  // google login 화면
  app.get(
    "/user/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  app.get('/user/google/callback', function(req, res, next) {
    passport.authenticate('google', async function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
      try {
        console.log('몽고유저 조회함 구글:',user)
        let mongoUser = await User.findOne({ email: user.email });
        if (!mongoUser) {
          mongoUser = new User({
            email: user.email,
            nickName:user.displayName,
            password:user.email,
            method:'google',
            profileUrl:user.picture,
            profileContent:'구글로 회원가입 하였습니다.',
          });
          await mongoUser.save();
        }
        const refreshPayload = {
          email: mongoUser.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 1), // Refresh token valid for 1 days
        };
        const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        console.log(`${process.env.ORIGIN}`);
        return res.redirect(`${process.env.ORIGIN}/`);
      } catch (error) {
        return res.redirect(`${process.env.ORIGIN}/Login`);
      }
    })(req, res, next);
  });

  app.get('/user', auth, async (req, res) => {
    const user = await User.find({});
    res.json(user);
  });

  app.get('/usertoken', auth, async (req, res) => { // auth 미들웨어 적용
    try {
      const user = await User.findOne({ email: req.user.email });
      console.log('액세스토큰',req.user.email)
      if (!user) res.status(404).send("No user found");
      const userResponse = user.toObject();
      delete userResponse.password;
      console.log(userResponse)
      return res.status(200).json({userResponse});
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/refreshToken',refreshauth, async (req, res) => { // auth 미들웨어 적용
    try {
      console.log('리프레시토큰',req.user.email)
      const payload = {
        email: req.user.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 30), //토큰 유효기간 30분
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.status(200).json({token});
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/user/:email', auth, async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) res.status(404).send("No user found");
      const userResponse = user.toObject();
      delete userResponse.password;
      res.send(userResponse);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.post('/user', async (req, res,next) => {
    try {
      const exUser = await User.findOne({email: req.body.email});
      if (exUser) {
        return res.status(403).send("이미 사용중인 아이디입니다");
      }
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      email: req.body.email,
      nickName: req.body.nickName,
      password: hashedPassword,
      method:'direct',
      profileUrl:'https://avatars.githubusercontent.com/u/32028454?s=400&u=7993b49546f6ebb45968dbafa6c97c5789ec2254&v=4',
      profileContent:'메인페이지로 회원가입 하였습니다.',
    })
    const savedUser = await user.save();
    res.json(savedUser);
  } catch(error){
    console.error(error);
    next(error)
  }
  });

  app.post("/user/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.reason);
      }
      return req.login(user, async (loginErr) => {
        if (loginErr) {
          console.log(err);
          return next(loginErr);
        }
        const payload = {
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 30), //토큰 유효기간 30분
        };
        const refreshPayload = {
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 1), // Refresh token valid for 1 days
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(200).json({ userResponse, token });
      });
    })(req, res, next);
  });

  app.post("/user/logout", (req, res, next) => {
    req.logout(() => {
      req.session.destroy();
      res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true, sameSite: 'None', secure: true });
      res.send("ok");
    });
  });

  app.patch('/user/:email/done', auth, async (req, res) => {
    try {
      let user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.done = req.body.done;
      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/user/:email/nickName', auth, async (req, res) => {
    try {
      let user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.nickName = req.body.nickName;
      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/user/:email', auth, async (req, res) => {
    try {
      let user = await User.findOneAndDelete({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User successfully deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}
