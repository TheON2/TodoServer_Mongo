module.exports = function(app, Todo)
{
    app.get('/todos', async (req, res) => {
        const todos = await Todo.find({});
        res.json(todos);
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
