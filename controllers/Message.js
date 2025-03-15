import ConversationModel from "../models/Converstion.js";
import MessageModel from "../models/Messages.js";

export const SendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;
  
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: `${!senderId ? "Sender Id" : !receiverId ? "Receiver Id" : "Message"} is required.`,
      });
    }
  
    try {
      // Create a new message
      const newMessage = new MessageModel({
        userId: senderId,
        message,
      });
      
      // Save the message first
      const savedMessage = await newMessage.save();
  
      // First try to find an existing conversation
      let conversation = await ConversationModel.findOne({
        members: { 
          $all: [senderId, receiverId],
          $size: 2
        }
      });
  
      if (conversation) {
        // If conversation exists, update it
        conversation = await ConversationModel.findByIdAndUpdate(
          conversation._id,
          {
            $push: { messages: savedMessage._id }
          },
          { new: true }
        );
      } else {
        // If no conversation exists, create a new one
        conversation = await ConversationModel.create({
          members: [senderId, receiverId],
          messages: [savedMessage._id]
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: {
          newMessage: savedMessage,
          conversation: conversation,
        },
      });
    } catch (error) {
      console.error("Message error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send message. Please try again." 
      });
    }
  };
  
export const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.body;
  // console.log('sendia',senderId,'reciverid')
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: `${!senderId ? "Sender Id" : "Receiver Id"} is required.`,
      });
    }

    try {
      // Find the conversation
      const conversation = await ConversationModel.findOne({
        members: {
          $all: [senderId, receiverId],
          $size: 2
        }
      }).populate('messages');

      if (!conversation) {
             const newConversation=  await ConversationModel.create({
          members: [senderId, receiverId],
        
        });
        return res.status(200).json({
          success: true,
          message: "Conversation created successfully",
          data: newConversation,
        });
      }

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: conversation.messages,
      });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve messages. Please try again."
      });
    }
  };