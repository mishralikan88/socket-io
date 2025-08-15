import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { useMemo } from "react";

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000/"), []);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketID] = useState();
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      console.log("Connected:", socket.id);
    });

    socket.on("welcome", (eventMessage) => {
      console.log(eventMessage);
    });

    socket.on("receive-message", (receivedMessage) => {
      setMessages((messages) => [...messages, receivedMessage]);
      console.log(receivedMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", { message, room });
      setMessage("");
    }
  };

  // Trigger the "join-room" event when the user clicks the "Join" button.
  // Sends the entered room name to the server so this socket can join that room.
  const joinRoomHandler = (e) => {
     e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName(""); // Clear the input field after joining
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to Socket.io Chat
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Type your message below and send it in real-time
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Socket ID - {socketID}
        </Typography>

        {/* form 1 */}
        <Box
          component="form"
          onSubmit={joinRoomHandler}
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <h5>Join Room</h5>
          <TextField
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            label="Room name"
            variant="outlined"
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ px: 3 }}
          >
            Join
          </Button>
        </Box>

        {/* form 2 */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Enter your message"
            variant="outlined"
            fullWidth
          />
          <TextField
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            label="Room"
            variant="outlined"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ px: 3 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
      <stack>
        {messages.map((message, idx) => (
          <Typography key={idx} variant="h6" component="div" gutterBottom>
            {message}
          </Typography>
        ))}
      </stack>
    </Container>
  );
};

export default App;
