const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = function(app, Todo)
{
    app.get('/todos', async (req, res) => {
        try {
          const token = req.cookies.refreshToken
          const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          req.user = decoded;
            const doneTodosCount = await Todo.countDocuments({writerEmail:req.user.email,done: false});
            const notDoneTodosCount = await Todo.countDocuments({writerEmail:req.user.email,done: true});
            const doneTodos = await Todo.find({writerEmail:req.user.email,done: true}).sort({ _id: -1 }).limit(4);
            const notDoneTodos = await Todo.find({writerEmail:req.user.email,done: false}).sort({ _id: -1 }).limit(4);
            res.json({Todos:[...doneTodos, ...notDoneTodos],doneTodosCount,notDoneTodosCount});
        } catch (err) {
            console.error(err);
            res.status(500).json({message: "Server error"});
        }
    });

    app.get('/todos/todo/:id', async (req, res) => {
      try {
        const todo = await Todo.findOne({ id: req.params.id });
        if (!todo) {
          return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json(todo)
      } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
      }
    });

    app.post('/todos/working/infinite', async (req, res) => {
        try {
          const token = req.cookies.refreshToken
          const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          req.user = decoded;
            const page = req.body.page;
            console.log(page)
            const size = 10; // 한 페이지당 로드될 아이템의 수
            const workingTodos = await Todo.find({writerEmail:req.user.email,done: false})
              .skip(page * size)
              .limit(size);
            res.json([...workingTodos]);
        } catch (err) {
            console.error(err);
            res.status(500).json({message: "Server error"});
        }
    });

    app.post('/todos/done/infinite', async (req, res) => {
        try {
          const token = req.cookies.refreshToken
          const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          req.user = decoded;
            const page = req.body.page;
            console.log(page)
            const size = 10; // 한 페이지당 로드될 아이템의 수
            const doneTodos = await Todo.find({writerEmail:req.user.email,done: true})
              .skip(page * size)
              .limit(size);
            res.json([...doneTodos]);
        } catch (err) {
            console.error(err);
            res.status(500).json({message: "Server error"});
        }
    });

  app.post('/todos/working/pagination', async (req, res) => {
    try {
      const token = req.cookies.refreshToken
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      req.user = decoded;
      const page = req.body.page;
      console.log(page)
      const size = 8; // 한 페이지당 로드될 아이템의 수
      const workingTodos = await Todo.find({writerEmail:req.user.email,done: false})
        .skip(page * size)
        .limit(size);
      const Todos = await Todo.find({writerEmail:req.user.email,done: false})
      console.log(Todo)

      res.json({ todos:workingTodos, pageNum:Math.ceil(Todos.length/8)});
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Server error"});
    }
  });

  app.post('/todos/done/pagination', async (req, res) => {
    try {
      const token = req.cookies.refreshToken
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      req.user = decoded;
      const page = req.body.page;
      console.log(page)
      const size = 8; // 한 페이지당 로드될 아이템의 수
      const doneTodos = await Todo.find({writerEmail:req.user.email,done: true})
        .skip(page * size)
        .limit(size);
      const Todos = await Todo.find({writerEmail:req.user.email,done: true})
      console.log(Todo)

      res.json({ todos:doneTodos, pageNum:Math.ceil(Todos.length/8)});
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Server error"});
    }
  });

    app.post('/todos', async (req, res) => {
        const newTodo = new Todo(req.body);
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    });

    app.patch('/todos/:id/done', async (req, res) => {
        try {
            let todo = await Todo.findOne({ id: req.params.id });
            if (!todo) {
                return res.status(404).json({ message: "Todo not found" });
            }
            todo.done = req.body.done;
            await todo.save();
          res.status(200).json({ message: '정상적으로 변경되었습니다.' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.patch('/todos/:id/content', async (req, res) => {
        try {
            let todo = await Todo.findOne({ id: req.params.id });
            if (!todo) {
                return res.status(404).json({ message: "Todo not found" });
            }
            todo.content = req.body.content;
            await todo.save();
          res.status(200).json({ message: '정상적으로 변경되었습니다.' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.delete('/todos/:id', async (req, res) => {
        try {
            let todo = await Todo.findOneAndDelete({ id: req.params.id });
            if (!todo) {
                return res.status(404).json({ message: "Todo not found" });
            }
          res.status(200).json({ message: '정상적으로 삭제되었습니다.' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}
