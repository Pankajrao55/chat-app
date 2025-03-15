
import mongoose from "mongoose";




const DbCon=async()=>{
    try {
        await mongoose.connect(process.env.MONGDB_URL)
        console.log('MONGDB IS CONNECTED:');
    } catch (error) {
        console.log('mongdb conntection error',error)
    }

    
    };
    


export default DbCon