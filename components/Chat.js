import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

let socket;

export default function Chat() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const assignedRoomId = session.user.email === 'user1@example.com' ? 'room-1' : 'room-2';
      setRoomId(assignedRoomId);

      if (!socket) {
        initializeSocket(assignedRoomId);
      }
    } else if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [session, status]);

  const initializeSocket = (roomId) => {
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinRoom', roomId);
      // Emit an event to notify the server that this user is online
      socket.emit('userOnline', { email: session.user.email });
    });

    // Listen for chat messages
    socket.on('chatMessage', (msg) => {
      if (msg && msg.message && msg.sender) {
        setMessages((prevMessages) => [...prevMessages, msg]);
        socket.emit('messageSeen', msg); // Emit that the message was seen
      } else {
        console.error('Invalid message format received:', msg);
      }
    });

    // Listen for updates to the online users
    socket.on('updateOnlineUsers', (users) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users); // Update the list of online users
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (socket && roomId) {
      const msg = {
        roomId,
        message: message.trim(),
        sender: session.user.email,
      };

      socket.emit('chatMessage', msg);
      setMessage(''); // Clear input after sending
    } else {
      console.error('Socket not connected or roomId not available');
    }
  };

  const formatSender = (sender) => {
    if (sender === session?.user?.email) {
      return 'You';
    }
    return 'Anonymous';
  };

  // Automatically scroll to the bottom when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col justify-between w-48 h-64 p-2 bg-white border border-gray-300 rounded-md">
      <div className="h-40 p-2 mb-2 overflow-y-auto bg-gray-100 rounded-md">
        <h2 className="text-[10px] font-semibold mb-2 text-center">Chat Room</h2>

        {/* Display online users */}
        <div className="text-[10px] mb-2 text-green-500">
          {onlineUsers.length > 0
            ? `Online: ${onlineUsers.length}`
            : 'No users online'}
        </div>

        {/* Display chat messages */}
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`text-[10px] mb-1 p-1 rounded-md ${
                msg.sender === session?.user?.email
                  ? 'bg-blue-200 text-right'
                  : 'bg-gray-300 text-left'
              }`}
            >
              <strong>{formatSender(msg.sender)}:</strong> {msg.message}
              {/* Display "Seen" label for the last message sent by the user */}
              {msg.sender === session?.user?.email &&
                index === messages.length - 1 && (
                  <span className="text-[8px] text-gray-500 ml-2">Seen</span>
                )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center text-[10px]">
            No messages yet
          </p>
        )}
        <div ref={messagesEndRef} /> {/* Reference to scroll to the bottom */}
      </div>
      <form onSubmit={sendMessage} className="flex items-center space-x-1">
        <input
          className="flex-1 p-1 text-[10px] border border-gray-300 rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button
          type="submit"
          className="p-1 bg-blue-500 text-white text-[10px] rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
