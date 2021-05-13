const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const logger = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");

const morgan = require("morgan");
const colors = require("colors");

//load env files
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDB();

//routes file
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

//initialise express
const app = express();

//Body Parser
app.use(express.json());

app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//fileupload
app.use(fileupload());

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

//custom async global error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle global unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server and exit process
  server.close(() => process.exit(1));
});
