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
const { trusted } = require("mongoose");

// enable cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id"
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
  let refreshToken = req.header("x-refresh-token");
  let _id = req.header("_id");

  User.findByIdAndToken(_id, refreshToken)
    .then((user) => {
      if (!user) {
        return Promise.reject({
          error:
            "User not found. Make sure that the refresh token and user id are correct",
        });
      }
      req.user_id = user._id;
      req.userObject = user;
      req.refreshToken = refreshToken;

      let isSessionValid = false;

      user.sessions.forEach((session) => {
        if (session.token === refreshToken) {
          // check if the session has expired
          if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
            // refresh token has not expired
            isSessionValid = true;
          }
        }
      });

      if (isSessionValid) {
        next();
      } else {
        return Promise.reject({
          error: "Refresh token has expired or the session is invalid",
        });
      }
    })
    .catch((e) => {
      res.status(401).send(e);
    });
};

// LIST ROUTES  //////////////////////////////////////////////

// GET
app.get("/lists", authenticate, (req, res) => {
  List.find({
    _userId: req.user_id,
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
app.post("/lists", authenticate, (req, res) => {
  let title = req.body.title;

  let newList = new List({
    title,
    _userId: req.user_id,
  });
  newList.save().then((listDoc) => {
    res.send(listDoc);
    res.send(console.log(title, newList));
  });
});

// UPDATE

app.patch("/lists/:id", authenticate, (req, res) => {
  List.findOneAndUpdate(
    { _id: req.params.id, _userId: req.user_id },
    {
      $set: req.body,
    }
  ).then(() => {
    res.send({ message: "updated successfully" });
  });
});

//  DELETE

app.delete("/lists/:id", authenticate, (req, res) => {
  List.findOneAndDelete({
    _id: req.params.id,
    _userId: req.user_id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);

    // delete all the tasks that are in the deleted list
    deleteTasksFromList(removedListDoc._id);
  });
});

// TASK ROUTES  //////////////////////////////////////////////

//GET
app.get("/lists/:listId/tasks", authenticate, (req, res) => {
  Task.find({ _listId: req.params.listId })
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((err) => {
      console.log(`this is Response error : ${err}`);
    });
});

//POST
app.post("/lists/:listId/tasks", authenticate, (req, res) => {
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id,
  })
    .then((list) => {
      if (list) {
        return true;
      } else {
        return false;
      }
    })
    .then((canCreateTask) => {
      if (canCreateTask) {
        let newTask = new Task({
          title: req.body.title,
          _listId: req.params.listId,
        });

        newTask.save().then((newTask) => {
          res.send(newTask);
        });
      } else {
        res.sendStatus(404);
      }
    });
});

//UPDATE
// app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
//   List.findOne({
//     _userId: req.user_id,
//     _id: req.params.listId,
//   })
//     .then((list) => {
//       if (list) {
//         return true;
//       } else {
//         return false;
//       }
//     })
//     .then((task) => {
//       if (task) {
//         Task.findOneAndUpdate(
//           {
//             _id: req.params.taskId,
//             _listId: req.params.listId,
//           },
//           { $set: req.body }
//         ).then(() => {
//           res.send("updated successfully");
//         });
//       } else {
//         res.sendStatus(404);
//       }
//     });
// });

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

// app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
//   const taskId = req.params.taskId;
//   const update = req.body;

//   List.findOne({
//     _userId: req.user_id,
//     _id: req.params.listId,
//   })
//     .then((list) => {
//       if (list) {
//         return true;
//       } else {
//         return false;
//       }
//     })
//     .then((task) => {
//       if (task) {
//         Task.findById(taskId)
//           .then((taskToUpdate) => {
//             if (!taskToUpdate) {
//               return res.status(404).send("Task not found");
//             }
//             Object.assign(taskToUpdate, update);
//             return taskToUpdate.save();
//           })
//           .then((updatedTask) => {
//             res.send(updatedTask);
//           });
//       } else {
//         res.sendStatus(404);
//       }
//     });
// });

//DELETE
app.delete("/lists/:listId/tasks/:taskId", authenticate, (req, res) => {
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id,
  })
    .then((list) => {
      if (list) {
        return true;
      }
      return false;
    })
    .then((task) => {
      if (task) {
        Task.findOneAndDelete({
          _id: req.params.taskId,
          _listId: req.params.listId,
        }).then((removedTaskDoc) => {
          res.send(removedTaskDoc);
          // won't send doc back => findOneAndDelete | findOneAndRemove
          // this is respones:
          //   {
          //     "acknowledged": true,
          //     "deletedCount": 1
          // }
        });
      } else {
        res.sendStatus(404);
      }
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
  req.userObject.generateAccessAuthToken().then((accessToken) => {
    res.header("x-access-token", accessToken);
    res.send({ accessToken });
  });
  // .catch((e) => {
  //   res.status(400).send(e);
  // });
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
