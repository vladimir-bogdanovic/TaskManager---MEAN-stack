const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/ToDoMeanapp")
  .then(() => {
    console.log("connected to mongoDB succsesfuly");
  })
  .catch((er) => {
    console.log(`error occured: ${er}`);
  });

// mongoose.set("useCreateIndex", true);
// mongoose.set("useFindAndModify", false);

module.exports = {
  mongoose,
};
