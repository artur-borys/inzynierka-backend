const { createLogger, format, transports } = require('winston');
const { combine, json, timestamp, prettyPrint, printf } = format;
const expressWinston = require("express-winston");

const console_transport = new transports.Console()

const combined_transport = new transports.File({
  filename: 'combined.log',
  level: 'info'
})

const error_transport = new transports.File({
  filename: 'error.log',
  level: 'error'
})

// const mFormat = combine(timestamp(), json(), prettyPrint())
const mFormat = combine(
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`
  })
)

module.exports.logger = createLogger({
  transports: [console_transport, combined_transport, error_transport],
  format: mFormat
})

module.exports.expressLogger = expressWinston.logger({
  transports: [combined_transport],
  format: mFormat,
  dynamicMeta: (req, res) => {
    return {
      ip: req.ip
    }
  }
})

module.exports.expressErrorLogger = expressWinston.errorLogger({
  transports: [error_transport],
  format: mFormat
})