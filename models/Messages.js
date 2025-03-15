import mongoose from "mongoose";


const MessageSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
})

const MessageModel=mongoose.model('Messages',MessageSchema)
export default MessageModel