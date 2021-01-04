const express = require("express");
const dotenv = require("dotenv");
const logger = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const morgan = require("morgan");
const colors = require("colors");

//load env files
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDB();

//routes file
const bootcamps = require("./routes/bootcamps");

//initialise express
const app = express();

//Body Parser
app.use(express.json());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//mount routes
app.use("/api/v1/bootcamps", bootcamps);

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
