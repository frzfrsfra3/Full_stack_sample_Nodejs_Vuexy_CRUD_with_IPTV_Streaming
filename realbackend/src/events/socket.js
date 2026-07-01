let io;
module.exports = {
  setupSocket: (socketIo) => {
    io = socketIo;
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  },
  getIO: () => io,
};