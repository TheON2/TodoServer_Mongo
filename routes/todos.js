module.exports = function(app, Todo)
{
    app.get('/todos', async (req, res) => {
        try {
            const doneTodosCount = await Todo.countDocuments({done: false});
            const notDoneTodosCount = await Todo.countDocuments({done: true});
            const doneTodos = await Todo.find({done: true}).limit(4);
            const notDoneTodos = await Todo.find({done: false}).limit(4);
            res.json({Todos:[...doneTodos, ...notDoneTodos],doneTodosCount,notDoneTodosCount});
        } catch (err) {
            console.error(err);
            res.status(500).json({message: "Server error"});
        }
    });

    app.post('/todos/working/infinite', async (req, res) => {
        try {
            const page = req.body.page;
            console.log(page)
            const size = 10; // 한 페이지당 로드될 아이템의 수
            const workingTodos = await Todo.find({done: false})
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
            const page = req.body.page;
            console.log(page)
            const size = 10; // 한 페이지당 로드될 아이템의 수
            const doneTodos = await Todo.find({done: true})
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
      const page = req.body.page;
      console.log(page)
      const size = 8; // 한 페이지당 로드될 아이템의 수
      const workingTodos = await Todo.find({done: false})
        .skip(page * size)
        .limit(size);
      const Todos = await Todo.find({done: false})
      console.log(Todo)

      res.json({ todos:workingTodos, pageNum:Math.ceil(Todos.length/8)});
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Server error"});
    }
  });

  app.post('/todos/done/pagination', async (req, res) => {
    try {
      const page = req.body.page;
      console.log(page)
      const size = 8; // 한 페이지당 로드될 아이템의 수
      const doneTodos = await Todo.find({done: true})
        .skip(page * size)
        .limit(size);
      res.json([...doneTodos]);
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
            res.json(todo);
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
            res.json(todo);
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
            res.json({ message: "Todo successfully deleted" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}
