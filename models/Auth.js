import mongoose from "mongoose";

const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    profile:{
        type:String,
        default:"https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?t=st=1732858684~exp=1732862284~hmac=cca83906cd9344fbc20131e617a74c4ffdc55df9b68a3cd4d45d402f85b3e6c3&w=826"
    },
    
})

const UserModel=mongoose.model('User',UserSchema)

export default UserModel
