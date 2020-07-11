const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { logger, expressLogger, expressErrorLogger } = require("./shared/logger")
const config = require("./config")

const app = express();
app.use(helmet());
app.use(cors());

app.use(expressLogger);

app.get("*", (req, res) => {
  res.status(404).json({
    error: "Not Found"
  })
})

app.use(expressErrorLogger)

app.listen(config.port, config.host, () => {
  logger.info(`Listening on ${config.host}:${config.port}`)
})