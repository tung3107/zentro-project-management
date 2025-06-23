const dotnet = require("dotenv").config({ path: "./config/config.env" });
const app = require("./app");

const { connectDB } = require("./models/index");
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const User = require("./models/User");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

connectDB();

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
