const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userModel = require('./models/Users.model')

const app= express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/Attendance")

app.post("/login",(req, res) =>{
    const {email,password} = req.body;
    userModel.findOne({email:email})
    .then(users=>{
        if(users){
            if(users.password===password){
                res.json("success")
            }
            else{
                res.json("incorrect credential1"+password)
            }
        }
        else{
            res.json("incorrect credential")
        }
    })
    .catch(err=>res.json(err))
})

app.listen(3001, ()=>{
    console.log("Server is Running")
})