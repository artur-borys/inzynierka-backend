const winston = require('winston');
const expressWinston = require("express-winston");

const combined_transport = new winston.transports.File({
  filename: 'combined.log',
  level: 'info'
})

const error_transport = new winston.transports.File({
  filename: 'error.log',
  level: 'error'
})

module.exports.logger = winston.createLogger({
  transports: [combined_transport, error_transport],
  format: winston.format.json()
})

module.exports.expressLogger = expressWinston.logger({
  transports: [combined_transport],
  format: winston.format.json()
})

module.exports.expressErrorLogger = expressWinston.errorLogger({
  transports: [error_transport],
  format: winston.format.json()
})