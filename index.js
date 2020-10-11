const express = require("express");
const http = require('http');
const helmet = require("helmet");
const compression = require('compression');
const cors = require("cors");
const { logger, expressLogger, expressErrorLogger } = require("./shared/logger")
const config = require("./config")
const initScript = require('./init')
const usersRouter = require("./components/users/router")
const emergencysRouter = require('./components/emergency/router');
const handbookRouter = require('./components/handbook/router')
const mongoose = require("mongoose")

const { app, server, io } = require('./server')
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({
  limit: '50mb'
}))

app.use(expressLogger);

app.use("/api", usersRouter);
app.use("/api", emergencysRouter);
app.use("/api", handbookRouter);

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
        error: "UNAUTHORIZED_TYPE"
      })
    } else {
      console.log(error)
      return res.status(500).json({
        error: "INTERNAL_SERVER_ERROR"
      })
    }
  } catch (err) {
    console.log(err)
    logger.error(err);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR"
    })
  }
})

mongoose.connect(config.mongo.url, config.mongo.options).then(() => {
  server.listen(config.port, config.host, () => {
    logger.info(`Listening on ${config.host}:${config.port}`)
  })
  initScript.init();
}, err => {
  logger.error(err);
})
