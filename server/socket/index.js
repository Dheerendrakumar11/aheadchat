// const User = require('../models/User');
// const Message = require('../models/Message');

// const setOffline = async (username) => {
//   await User.findOneAndUpdate({ username }, { isOnline: false, socketId: '' });
// };

// module.exports = (io) => {
//   io.on('connection', (socket) => {
//     console.log(`Socket connected: ${socket.id}`);

//     socket.on('user-online', async (username) => {
//       socket.data.username = username;
//       const user = await User.findOneAndUpdate(
//         { username },
//         { isOnline: true, socketId: socket.id },
//         { upsert: true, new: true }
//       );
//       console.log(`${username} is online with socket ID ${socket.id}`);
//       io.emit('user-status', { userId: username, online: true });
//     });

//     socket.on('typing', async ({ sender, receiver }) => {
//       console.log(`${sender} is typing to ${receiver}`);
//       const receiverUser = await User.findOne({ username: receiver });
//       if (receiverUser?.socketId) {
//         io.to(receiverUser.socketId).emit('typing', { sender });
//       }
//     });

//     socket.on('send-message', async ({ sender, receiver, content }) => {
//       const message = await Message.create({ sender, receiver, content });
//       console.log(`Message from ${sender} to ${receiver}: "${content}"`);
//       socket.emit('receive-message', message);

//       const receiverUser = await User.findOne({ username: receiver });
//       if (receiverUser?.socketId) {
//         io.to(receiverUser.socketId).emit('receive-message', message);
//       }
//     });

//     socket.on('disconnect', async () => {
//       const username = socket.data?.username;
//       console.log(`Socket disconnected: ${socket.id} (User: ${username})`);
//       if (username) {
//         await setOffline(username);
//         io.emit('user-status', { userId: username, online: false });
//         console.log(`${username} set to offline`);
//       }
//     });
//   });
// };


const User = require('../models/User');
const Message = require('../models/Message');

const setOffline = async (username) => {
  await User.findOneAndUpdate({ username }, { isOnline: false, socketId: '' });
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user-online', async (username) => {
      socket.data.username = username;
      const user = await User.findOneAndUpdate(
        { username },
        { isOnline: true, socketId: socket.id },
        { upsert: true, new: true }
      );
      console.log(`${username} is online with socket ID ${socket.id}`);
      io.emit('user-status', { userId: username, online: true });
    });

    socket.on('typing', async ({ sender, receiver }) => {
      const receiverUser = await User.findOne({ username: receiver });
      if (receiverUser?.socketId) {
        io.to(receiverUser.socketId).emit('typing', { sender });
      }
    });

    socket.on('send-message', async ({ sender, receiver, content }) => {
      const message = await Message.create({ sender, receiver, content });
      console.log(`Message from ${sender} to ${receiver}: "${content}"`);

      socket.emit('receive-message', message); // sender side
      const receiverUser = await User.findOne({ username: receiver });
      if (receiverUser?.socketId) {
        io.to(receiverUser.socketId).emit('receive-message', message); // receiver side
      }
    });

    socket.on('check-user-status', async (receiver) => {
      const receiverUser = await User.findOne({ username: receiver });
      if (receiverUser) {
        const isOnline = receiverUser.isOnline;
        socket.emit('user-status', { userId: receiver, online: isOnline });
      }
    });

    socket.on('disconnect', async () => {
      const username = socket.data?.username;
      console.log(`Socket disconnected: ${socket.id} (User: ${username})`);
      if (username) {
        await setOffline(username);
        io.emit('user-status', { userId: username, online: false });
        console.log(`${username} set to offline`);
      }
    });
  });
};
