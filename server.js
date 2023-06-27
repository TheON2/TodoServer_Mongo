let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let cors = require('cors')

// [CONFIGURE APP TO USE bodyParser]
app.use(cors({
  origin:'http://localhost:3000',
  credentials:true,
}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://sparta:test@cluster0.xi1pqvv.mongodb.net/dbsparta?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB server'))
  .catch((err) => console.error(err));

let Todo = require('./models/todo');

let router = require('./routes')(app, Todo);

let server = app.listen(port, function () {
  console.log("Express server has started on port " + port)
});
