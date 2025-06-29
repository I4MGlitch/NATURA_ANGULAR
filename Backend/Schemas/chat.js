const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
});

const chatSchema = mongoose.Schema({
    participants: [{ type: String, required: true }], // Array to store user IDs involved in the chat
    messages: [messageSchema], // Embed messages
});

module.exports = mongoose.model('chat', chatSchema);