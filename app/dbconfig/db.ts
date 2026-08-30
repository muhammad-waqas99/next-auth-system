
import mongoose from 'mongoose'

export default async function connectToDB() {
    

     try {

         mongoose.connect(process.env.mongoUri!)
          const connection = mongoose.connection;

          connection.on('connection' , ()=>{
                console.log("MongoDB Connected Successfully")
          })

          connection.on("error" , (error)=>{
            console.log("Error in Mongo DB connection , Please make sure mongodb is running " + error)
            process.exit()
          })


     } catch (error :any) {
         console.log("Something went wrong")
         console.log("Error in Mongodb Connection " , error.messege)
     }
}

6MgWcorHkw51IuLZ
muhammadwaqasdev99_db_user
mongodb+srv://muhammadwaqasdev99_db_user:6MgWcorHkw51IuLZ@cluster0.6r4slnx.mongodb.net/?appName=Cluster0