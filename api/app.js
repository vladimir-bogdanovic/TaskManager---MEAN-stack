const express = require("express");
const app = express();
app.use(express.json());

const mongoose = require("./db/mongoose");

// const { List, Task } = require("./db/models/index");
const List = require("./db/models/list.model");
const Task = require("./db/models/task.model");

// enable cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",

    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// load middleware
// app.use(bodyParser.json());

// LIST ROUTES

// GET
app.get("/lists", (req, res) => {
  List.find({})
    .then((lists) => {
      res.send(lists);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while fetching lists.");
    });
});

// POST
app.post("/lists", (req, res) => {
  let title = req.body.title;

  let newList = new List({
    title,
  });
  newList
    .save()
    .then((listDoc) => {
      res.send(listDoc);
      res.send(console.log(title, newList));
    })
    .catch((error) => {
      console.error("Error saving list:", error);
      res.status(500).send("An error occurred while saving the list.");
    });
});

// UPDATE
app.patch("/lists/:id", (req, res) => {
  const listId = req.params.id;
  const update = req.body;

  List.findById(listId)
    .then((list) => {
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
      Object.assign(list, update);
      return list.save();
    })
    .then((updateList) => {
      res.json(updateList);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error updating list:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the list" });
    });
});

//  DELETE
app.delete("/lists/:id", (req, res) => {
  const listId = req.params.id;

  List.deleteOne({ _id: listId })
    .then((deleteList) => {
      res.send(deleteList);
    })
    .catch((error) => {
      console.error("Error deleting list:", error);
      res.status(500).send("An error occurred while deleting the list.");
    });
});

// TASK ROUTES

//GET
app.get("/lists/:listId/tasks", (req, res) => {
  Task.find({ _listId: req.params.listId })
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((err) => {
      console.log(`this is Response error : ${err}`);
    });
});

//POST
app.post("/lists/:listId/tasks", (req, res) => {
  let newTask = new Task({
    title: req.body.title,
    _listId: req.params.listId,
  });

  newTask.save().then((newTask) => {
    res.send(newTask);
  });
});

//UPDATE
app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const update = req.body;

  Task.findById(taskId)
    .then((taskToUpdate) => {
      if (!taskToUpdate) {
        return res.status(404).send("Task not found");
      }
      Object.assign(taskToUpdate, update);
      return taskToUpdate.save();
    })
    .then((updatedTask) => {
      res.send(updatedTask);
    });
});

//DELETE
app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.deleteOne({ _id: req.params.taskId }).then((deletedTask) => {
    res.send(deletedTask);
  });
});

//LISTENING
app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
