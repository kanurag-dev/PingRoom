const express=require("express")
const PORT=3000;
const cors=require("cors");
const app=express();
const connectDB=require("./db")
const dotenv=require("dotenv")
const messageRoutes=require("./routes/messages")

dotenv.config();
app.use(express.json())
app.use(cors());
connectDB();

app.use("/api/messages",messageRoutes)

app.get("/",(req,res)=>{
    res.json({message:"GLobal chat by API"})
})

app.listen(PORT,()=>{
    console.log("server up")
})
