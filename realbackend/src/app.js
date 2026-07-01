require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const apiRoutes = require('./routes/api');
const { setupSocket } = require('./events/socket');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', apiRoutes);

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));