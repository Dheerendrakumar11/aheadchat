const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors')
const socketIo = require('socket.io');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

require('./socket')(io);

app.use(express.json());
app.use(cors())
app.use('/api/messages', messageRoutes);

mongoose.connect('mongodb+srv://dhrajch:TsGubpIyPEvQGNNx@cluster0.bvdpvt9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => console.log('MongoDB connected'));

server.listen(5000, () => console.log('Server running on port 5000'));