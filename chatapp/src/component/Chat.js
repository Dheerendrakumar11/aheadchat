// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';

// const socket = io('http://localhost:5000', {
//   autoConnect: false,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// function Chat({ username }) {
//   const [receiver, setReceiver] = useState('');
//   const [message, setMessage] = useState('');
//   const [chat, setChat] = useState([]);
//   const [typingStatus, setTypingStatus] = useState('');
//   const [onlineStatus, setOnlineStatus] = useState('');

//   useEffect(() => {
//     if (!username) return;

//     // Connect and emit join
//     socket.connect();
//     socket.emit('join', username);

//     socket.on('receive-message', ({ sender, content }) => {
//       setChat((prev) => [...prev, { sender, content }]);
//     });

//     socket.on('typing', ({ sender, receiver: to }) => {
//       if (to === username) {
//         setTypingStatus(`${sender} is typing...`);
//         setTimeout(() => setTypingStatus(''), 2000);
//       }
//     });

//     socket.on('user-status', ({ userId, online }) => {
//       if (userId === receiver) {
//         setOnlineStatus(online ? `${userId} is online` : `${userId} is offline`);
//       }
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [username, receiver]);

//   useEffect(() => {
//     if (!username || !receiver) return;

//     // Load chat history
//     axios
//       .get(`http://localhost:5000/api/messages/${username}/${receiver}`)
//       .then((res) => {
//         setChat(res.data);
//       })
//       .catch((err) => {
//         console.error('Failed to load messages:', err.message);
//       });

//     socket.emit('check-user-status', receiver);
//   }, [receiver]);

//   const sendMessage = async () => {
//     if (!message || !receiver) return;

//     // Emit to socket and persist via API
//     socket.emit('send-message', {
//       sender: username,
//       receiver,
//       content: message,
//     });

//     await axios.post('http://localhost:5000/api/messages/send', {
//       sender: username,
//       receiver,
//       content: message,
//     });

//     setChat((prev) => [...prev, { sender: username, content: message }]);
//     setMessage('');
//   };

//   const handleTyping = () => {
//     if (receiver) {
//       socket.emit('typing', { sender: username, receiver });
//     }
//   };

//   return (
//     <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
//       <h2>Logged in as: {username}</h2>

//       <input
//         type="text"
//         placeholder="Receiver username"
//         value={receiver}
//         onChange={(e) => setReceiver(e.target.value)}
//         style={{ width: '100%', marginBottom: 10 }}
//       />

//       <div
//         style={{
//           border: '1px solid #ccc',
//           height: '300px',
//           overflowY: 'scroll',
//           padding: '10px',
//           marginBottom: 10,
//         }}
//       >
//         {chat.map((msg, idx) => (
//           <div
//             key={idx}
//             style={{
//               display: 'flex',
//               justifyContent: msg.sender === username ? 'flex-end' : 'flex-start',
//               marginBottom: 10,
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: msg.sender === username ? '#dcf8c6' : '#f1f0f0',
//                 padding: '10px',
//                 borderRadius: '8px',
//                 maxWidth: '70%',
//               }}
//             >
//               <strong>{msg.sender}:</strong> {msg.content}
//             </div>
//           </div>
//         ))}
//         {typingStatus && <p style={{ color: 'black' }}>{typingStatus}</p>}
//       </div>

//       <div style={{ marginBottom: 10, fontStyle: 'italic' }}>
//         <p>{onlineStatus}</p>
//       </div>

//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={handleTyping}
//         placeholder="Type message"
//         style={{ width: '100%', marginBottom: 10 }}
//       />

//       <button onClick={sendMessage} style={{ width: '100%' }}>
//         Send
//       </button>
//     </div>
//   );
// }

// export default Chat;


import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function Chat({ username }) {
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('');

  useEffect(() => {
    if (!username) return;

    socket.connect();
    socket.emit('user-online', username); // ✅ match with backend

    socket.on('receive-message', ({ sender, content }) => {
      setChat((prev) => [...prev, { sender, content }]);
    });

    socket.on('typing', ({ sender }) => {
      if (sender === receiver) {
        setTypingStatus(`${sender} is typing...`);
        setTimeout(() => setTypingStatus(''), 2000);
      }
    });

    socket.on('user-status', ({ userId, online }) => {
      if (userId === receiver) {
        setOnlineStatus(online ? `${userId} is online` : `${userId} is offline`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [username, receiver]);

  useEffect(() => {
    if (!username || !receiver) return;

    axios
      .get(`http://localhost:5000/api/messages/${username}/${receiver}`)
      .then((res) => {
        setChat(res.data);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err.message);
      });

    socket.emit('check-user-status', receiver); // ✅ now supported
  }, [receiver]);

  const sendMessage = async () => {
    if (!message || !receiver) return;

    socket.emit('send-message', {
      sender: username,
      receiver,
      content: message,
    });

    await axios.post('http://localhost:5000/api/messages/send', {
      sender: username,
      receiver,
      content: message,
    });

    setChat((prev) => [...prev, { sender: username, content: message }]);
    setMessage('');
  };

  const handleTyping = () => {
    if (receiver) {
      socket.emit('typing', { sender: username, receiver });
    }
  };

  return (
    <div
  style={{
    maxWidth: 500,
    margin: 'auto',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <h2 style={{ textAlign: 'center', color: '#4CAF50' }}>Logged in as: {username}</h2>

  <input
    type="text"
    placeholder="Receiver username"
    value={receiver}
    onChange={(e) => setReceiver(e.target.value)}
    style={{
      width: '100%',
      marginBottom: 10,
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px',
    }}
  />

  <div
    style={{
      border: '1px solid #ccc',
      height: '300px',
      overflowY: 'scroll',
      padding: '10px',
      marginBottom: 10,
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
    }}
  >
    {chat.map((msg, idx) => (
      <div
        key={idx}
        style={{
          display: 'flex',
          justifyContent: msg.sender === username ? 'flex-end' : 'flex-start',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            backgroundColor: msg.sender === username ? '#dcf8c6' : '#f1f0f0',
            padding: '10px',
            borderRadius: '8px',
            maxWidth: '70%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <strong>{msg.sender}:</strong> {msg.content}
        </div>
      </div>
    ))}
    {typingStatus && <p style={{ color: '#888', fontStyle: 'italic' }}>{typingStatus}</p>}
  </div>

  <div style={{ marginBottom: 10, fontStyle: 'italic' }}>
    <p style={{ color: '#888' }}>{onlineStatus}</p>
  </div>

  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={handleTyping}
    placeholder="Type message"
    style={{
      width: '95%',
      padding: '10px',
      marginBottom: 10,
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '16px',
    }}
  />

  <button
    onClick={sendMessage}
    style={{
      width: '100%',
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
    onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
  >
    Send
  </button>
</div>

  );
}

export default Chat;
