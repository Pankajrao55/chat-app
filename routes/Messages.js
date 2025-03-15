import express from 'express'
import { getMessages, SendMessage } from '../controllers/Message.js'

const MessageRoutes=express.Router()

MessageRoutes.post('/send_message',SendMessage)
MessageRoutes.post('/get_messages', getMessages)
export default MessageRoutes