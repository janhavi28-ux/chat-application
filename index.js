const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb+srv://janhavigurav282004:janhavi28@cluster0.0tlcgn5.mongodb.net/chatDB");

// Message model
const Message = mongoose.model("Message", new mongoose.Schema({
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
}));

// Create server & socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send previous messages to the new user
  Message.find().sort({ createdAt: 1 }).then(messages => {
    socket.emit("previousMessages", messages);
  });

  // Listen for messages
  socket.on("chatMessage", (data) => {
    const newMsg = new Message(data);
    newMsg.save().then(() => {
      io.emit("chatMessage", newMsg);
    });
  });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
