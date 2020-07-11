const { createLogger, format, transports } = require('winston');
const { combine, json, timestamp, prettyPrint } = format;
const expressWinston = require("express-winston");

const combined_transport = new transports.File({
  filename: 'combined.log',
  level: 'info'
})

const error_transport = new transports.File({
  filename: 'error.log',
  level: 'error'
})

const mFormat = combine(timestamp(), json(), prettyPrint())

module.exports.logger = createLogger({
  transports: [combined_transport, error_transport],
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