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
app.use(async (error, req, res, next) => {
  try {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "TOKEN_EXPIRED"
      })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "INVALID_TOKEN"
      })
    } else if (error.message === "UnauthorizedType") {
      return res.status(401).json({
        error: "UNAUTHORIZED"
      })
    } else {
      return res.status(500).json({
        error: "INTERNAL_SERVER_ERROR"
      })
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR"
    })
  }
})

mongoose.connect("mongodb://localhost/first-aid-help", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.listen(config.port, config.host, () => {
    logger.info(`Listening on ${config.host}:${config.port}`)
  })
}, err => {
  logger.error(err);
})
