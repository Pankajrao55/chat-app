import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Ensure the correct name of your User model
      required: true,
    }
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Messages', // Ensure the correct name of your Messages model
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Ensure the model name matches its purpose
const ConversationModel = mongoose.model('Conversation', ConversationSchema);
export default ConversationModel;
