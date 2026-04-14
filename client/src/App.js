import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [document, setDocument] = useState("");
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState("");
    const [username, setUsername] = useState("");
    const [typingUser, setTypingUser] = useState("");

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:5000');
        setSocket(newSocket);

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'init') {
                    setDocument(message.data);
                } 
                else if (message.type === 'update') {
                    setDocument(message.data);
                    setTypingUser(message.username || "");
                }

            } catch (error) {
                console.error('Error:', error);
            }
        };

        return () => newSocket.close();
    }, []);

    const handleJoinRoom = () => {
        socket.send(JSON.stringify({
            type: 'join',
            room: room
        }));
    };

    const handleChange = (e) => {
        const newDocument = e.target.value;
        setDocument(newDocument);

        socket.send(JSON.stringify({
            type: 'update',
            data: newDocument,
            room: room,
            username: username
        }));
    };

    return (
        <div className="App">
            <h1>Collaborative Editor</h1>

            <input
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                placeholder="Enter Room ID"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />

            <button onClick={handleJoinRoom}>Join Room</button>

            <p>{typingUser && `${typingUser} is typing...`}</p>

            <textarea
                value={document}
                onChange={handleChange}
                rows="20"
                cols="80"
            />
        </div>
    );
}

export default App;