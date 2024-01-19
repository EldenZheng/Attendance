const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userModel = require('./models/Users.model')
const shiftModel = require('./models/Attendance.models')

const app= express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/Attendance")

app.get('/', (req, res)=>{
    shiftModel.find({})
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

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
        duration: 0,
        endTime: '00:00:00',
    })
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.put("/EndShift", (req, res) =>{
    const currentDateandTime = new Date();
    const hours = currentDateandTime.getHours();
    const minutes = currentDateandTime.getMinutes();
    const seconds = currentDateandTime.getSeconds();
    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const { email, duration } = req.body;

    shiftModel.findOneAndUpdate({email:email} ,{
        duration: duration,
        endTime:formattedTime
    })
    .then(shift=>{
        if (shift) {
            res.json(true);
        } else {
            res.json(false);
        }
    })
    .catch(err=>res.json(err))
})

app.get("/checkShift/:email",(req,res)=>{
    const today = new Date().toISOString().split('T')[0];
    const email = req.params.email;
    shiftModel.findOne({
        email: email,
        date: today
    })
    .then(shift => {
        if (shift) {
            if(shift.duration==="0"){
                return res.json({ hasnt: true, startTime: shift.startTime });
            }else{
                return res.json("complete")
            }
            
        }else {
            return res.json(false);
        }
    })
    .catch(err => res.json(err));
});


app.get("/getUser/:email", (req, res) =>{
    const email = req.params.email;
    userModel.findOne({email:email})
    .then(users=>res.json(users))
    .catch(err=>res.json(err))
})

app.listen(3001, ()=>{
    console.log("Server is Running")
})