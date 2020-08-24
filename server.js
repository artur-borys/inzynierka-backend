const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { logger } = require('./shared/logger')

const adminNsp = io.of('/admin');
const emergencyNsp = io.of('/emergency')

adminNsp.on('connection', (socket) => {
  logger.info(`Socket connected adminNsp, userId: ${socket.handshake.query.userId}`)
  socket.emit('pingpong');
})

emergencyNsp.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const emergencyId = socket.handshake.query.emergency;
  logger.info(`Socket connected emergencyNsp, userId: ${userId}, emergencyId: ${emergencyId}`)

  socket.join(emergencyId, () => {
    socket.on('emergencyUpdate', () => {
      socket.to(emergencyId).emit('emergencyUpdated')
    })

    socket.on('imageUpload', (imageId) => {
      socket.to(emergencyId).emit('imageUploaded', imageId)
    })
  })

  socket.on('disconnecting', (reason) => {
    logger.info(`[emergencyNsp] Socket disconnecting, ${userId}`)
  })
})

module.exports = {
  app,
  server,
  io,
  adminNsp,
  emergencyNsp,
}