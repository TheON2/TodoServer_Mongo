let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let cors = require('cors')
const morgan = require("morgan"); //프론트에서 백엔드로 어떤요청들을 보냈는지 로그를 띄워줌
const passportConfig = require("./passport");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Todo = require('./models/todo');
const User = require('./models/user');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();
passportConfig();

const port = process.env.PORT || 3001;
const origin = process.env.ORIGIN || 'https://todo-list-pi-wine.vercel.app';

console.log(origin)

app.use(morgan("dev"));
app.use(cors({
  origin:origin,
  credentials:true,
}))
app.use('/',express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB server'))
  .catch((err) => console.error(err));
app.use(passport.initialize());

const routerTodos = require('./routes/todos')(app, Todo);
const routerUser = require('./routes/user')(app, User);

let server = app.listen(port, function () {
  console.log("Express server has started on port " + port)
});
