const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userModel = require('./models/Users.model')
const shiftModel = require('./models/Attendance.models')

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
                res.json("incorrect credential")
            }
        }
        else{
            res.json("incorrect credential")
        }
    })
    .catch(err=>res.json(err))
})

app.post("/StartShift",(req,res)=>{
    const currentDateandTime = new Date();
    const year = currentDateandTime.getFullYear();
    const month = currentDateandTime.getMonth() + 1;
    const day = currentDateandTime.getDate();

    const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    const hours = currentDateandTime.getHours();
    const minutes = currentDateandTime.getMinutes();
    const seconds = currentDateandTime.getSeconds();

    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    shiftModel.create({
        email:req.body.email,
        date: formattedDate,
        startTime: formattedTime,
        duration: 0
    })
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.get("/checkShift/:email",(req,res)=>{
    const email = req.params.email;
    shiftModel.findOne({email:email})
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.get("/getUser/:email", (req, res) =>{
    const email = req.params.email;
    userModel.findOne({email:email})
    .then(users=>res.json(users))
    .catch(err=>res.json(err))
})

app.listen(3001, ()=>{
    console.log("Server is Running")
})