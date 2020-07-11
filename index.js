const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { logger, expressLogger, expressErrorLogger } = require("./shared/logger")
const config = require("./config")
const usersRouter = require("./components/users/router")
const mongoose = require("mongoose")

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json())

app.use(expressLogger);

app.use("/api", usersRouter);

app.get("*", (req, res) => {
  res.status(404).json({
    error: "Not Found"
  })
})

app.use(expressErrorLogger)


mongoose.connect("mongodb://localhost/first-aid-help", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(config.port, config.host, () => {
    logger.info(`Listening on ${config.host}:${config.port}`)
  })
}, err => {
  logger.error(err);
})
