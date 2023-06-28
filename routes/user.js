const bcrypt = require('bcrypt')
const {isNotLoggedIn} = require("./middlewares");
const passport = require("passport");

module.exports = function(app, User)
{
  app.get('/user', async (req, res) => {
    const user = await User.find({});
    res.json(user);
  });

  app.get('/user/:email', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) res.status(404).send("No user found");
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.post('/user',isNotLoggedIn, async (req, res,next) => {
    try {
      const exUser = await User.findOne({email: req.body.email});
      if (exUser) {
        return res.status(403).send("이미 사용중인 아이디입니다"); //return이 없다면 밑에 res.send가 있어서 응답을 2번보내는셈이 돼버림
      }
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    const user = new User({
      email: req.body.email,
      nickName: req.body.nickName,
      password: hashedPassword,
    })
    const savedUser = await user.save();
    res.json(savedUser);
  } catch(error){
    console.error(error);
    next(error)
  }
  });

  app.post("/user/login", isNotLoggedIn, (req, res, next) => {
    //이걸 미들웨어 확장이라고 한다. 원래 passport.authenticate는 req,res,next를 쓸수없는 미들웨어인데 그걸 확장해서 쓸수 있게하는 express기법
    passport.authenticate('local', (err, user, info) => {
      //passport전략실행 //passport의 done이 콜백같은거라 이게 여기로 전달됨
      if (err) {
        console.log(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.reason); //info - 클라측 에러
      }
      return req.login(user, async (loginErr) => {
        //req.login을 하면 같이 실행되는 코드는 index의 serializeUser와
        //여기서 로그인은 패스포트 로그인이다. 여기서 에러가 날 경우를 처리해주는 코드
        if (loginErr) {
          console.log(err);
          return next(loginErr);
        }
        const loginUser = await User.findOne({email: req.body.email});
        return res.status(200).json(loginUser); // 사용자정보를 프론트로 넘겨줌
      });
    })(req, res, next);
  });

  app.patch('/user/:email/done', async (req, res) => {
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

  app.patch('/user/:email/nickName', async (req, res) => {
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

  app.delete('/user/:email', async (req, res) => {
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
