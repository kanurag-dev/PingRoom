const User=require("../models/user");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req,res){
    const {username,email,password}=req.body;
    const isALreadyRegistered=await User.findOne({
        $or:[{username},{email}]
    })
    if(isALreadyRegistered){
        return res.status(409).json({
            message:"email exists"
        })
    }
    const hashPassword=await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        email,
        password:hashPassword
    })
    const token=jwt.sign({
        id:user._id
    },process.env.JWT_SECRET,{
        expiresIn:"1h"
    });
    return res.status(201).json({
        message:"registered successfully",
        user:{
            username:user.username,
            email:user.email,
            
        },
        token
    
    });

}
module.exports=register;