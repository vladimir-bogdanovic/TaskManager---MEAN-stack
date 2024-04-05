const express = require("express");
const app = express();
app.use(express.json());

const jwt = require("jsonwebtoken");

const mongoose = require("./db/mongoose");

const jwtSecret = "51778657246321226641fsdklafjasdkljfsklfjd7148924065";

// const { List, Task } = require("./db/models/index");
const List = require("./db/models/list.model");
const Task = require("./db/models/task.model");
const { User } = require("./db/models/user.model");

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
  res.header(
    "Access-Control-Expose-Headers",
    "x-access-token, x-refresh-token"
  );
  next();
});

//MIDLLEWARE;

let authenticate = (req, res, next) => {
  let token = req.header("x-access-token");
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(401).send(err);
    } else {
      req.user_id = decoded._id;
      console.log(decoded);
      next();
    }
  });
};

let verifySession = (req, res, next) => {
  let _id = req.header("_id");
  let refreshToken = req.header("x-refresh-token");

  User.findByIdAndToken(_id, refreshToken).then((user) => {
    if (!user) {
      return Promise.reject({
        error:
          "User not found. Make sure that the refresh token and user id are correct",
      });
    }

    req.user_id = user._id;
    req.userObject = user;
    req.refreshToken = refreshToken;

    user.sessions
      .forEach((session) => {
        if (
          session.token === refreshToken &&
          User.hasRefreshTokenExpired() === false
        ) {
          next();
        } else {
          return Promise.reject({
            error: "Refresh token has expired or the session is invalid",
          });
        }
      })
      .catch((err) => {
        res.status(401).send(err);
      });
  });
};

// LIST ROUTES  //////////////////////////////////////////////

// GET
app.get("/lists", (req, res) => {
  List.find({
    //   _userId: req.user_id,
  })
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
  // We want to delete the specified list (document with id in the URL)
  List.findOneAndDelete({
    _id: req.params.id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);

    // delete all the tasks that are in the deleted list
    deleteTasksFromList(removedListDoc._id);
  });
});

// TASK ROUTES  //////////////////////////////////////////////

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

//  USER ROUTES

// POST
//signin
app.post("/users", (req, res) => {
  let body = req.body;
  let newUser = new User(body);

  newUser
    .save()
    .then(() => {
      return newUser.createSession();
    })
    .then((refreshToken) => {
      return newUser.generateAccessAuthToken().then((accessToken) => {
        return { accessToken, refreshToken };
      });
    })
    .then((authTokens) => {
      res
        .header("x-refresh-token", authTokens.refreshToken)
        .header("x-access-token", authTokens.accessToken)
        .send(newUser);
    })
    .catch((err) => {
      res.send(err);
    });
});

//POST
//login

app.post("/users/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password)
    .then((user) => {
      return user
        .createSession()
        .then((refreshToken) => {
          return user.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken };
          });
        })
        .then((authTokens) => {
          res
            .header("x-refresh-token", authTokens.refreshToken)
            .header("x-access-token", authTokens.accessToken)
            .send(user);
        });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

//   GET ACCESS TOKEN
app.get("/users/me/access-token", verifySession, (req, res) => {
  req.userObject
    .generateAccessAuthToken()
    .then((accessToken) => {
      res.header("x-access-token", accessToken);
      res.send({ accessToken });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

// HELPER METHODS

let deleteTasksFromList = (_listId) => {
  Task.deleteMany({
    _listId,
  }).then(() => {
    console.log("Tasks from " + _listId + " were deleted!");
  });
};

//LISTENING
app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
