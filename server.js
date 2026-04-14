const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store documents per room
let rooms = {};

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.room = null;

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            // 🟢 JOIN ROOM
            if (parsedMessage.type === 'join') {
                ws.room = parsedMessage.room;

                if (!rooms[ws.room]) {
                    rooms[ws.room] = "";
                }

                ws.send(JSON.stringify({
                    type: 'init',
                    data: rooms[ws.room]
                }));
            }

            // 🟡 UPDATE DOCUMENT
            else if (parsedMessage.type === 'update') {
                if (!ws.room) return;

                rooms[ws.room] = parsedMessage.data;

                // Send update only to same room users
                wss.clients.forEach((client) => {
                    if (
                        client.readyState === WebSocket.OPEN &&
                        client.room === ws.room
                    ) {
                        client.send(JSON.stringify({
                            type: 'update',
                            data: rooms[ws.room],
                            username: parsedMessage.username
                        }));
                    }
                });
            }

        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});