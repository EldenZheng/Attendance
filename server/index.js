const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userModel = require('./models/Users.model')
const shiftModel = require('./models/Attendance.models')
const apprvModel = require('./models/Approval.model')

const app= express()
app.use(cors({
    origin:["https://attendance-red.vercel.app"],
    methods:["POST", "GET", "PUT", "DELETE"],
    credentials:true
}))
app.use(express.json())

mongoose.connect("mongodb+srv://eldenzheng:DyvaJdZFgL9TdEfp@testcluster.rkuoq6x.mongodb.net/Attendance?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

function countWeekdays(start, end) {
    let totalDays = 0;
    while (start <= end) {
        const dayOfWeek = start.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
            totalDays++;
        }
        start.setDate(start.getDate() + 1); // Move to the next day
    }
    return totalDays;
}

app.get('/', (req, res)=>{
    res.json("Server is running!")
})

app.get('/getShift', (req, res)=>{
    shiftModel.find({})
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.post("/Login",(req, res) =>{
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
    // const currentDateandTime = new Date();
    // const year = currentDateandTime.getFullYear();
    // const month = currentDateandTime.getMonth() + 1;
    // const day = currentDateandTime.getDate();

    // const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    // const hours = currentDateandTime.getHours();
    // const minutes = currentDateandTime.getMinutes();
    // const seconds = currentDateandTime.getSeconds();

    // const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const { email, onTime, selectedOption, formattedDate, formattedTime } = req.body;
    shiftModel.create({
        email:email,
        date: formattedDate,
        startTime: formattedTime,
        duration: 0,
        endTime: '00:00:00',
        stat: onTime ? 'On Time' : selectedOption
    })
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.post("/requestApprove",(req,res)=>{
    const { email, startDate, endDate } = req.body;
    apprvModel.create({
        email:email,
        approvalType: "DLK",
        startDate: startDate,
        endDate: endDate,
        status: "Approved"
    })
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.put("/EndShift", (req, res) =>{
    // const currentDateandTime = new Date();
    // const year = currentDateandTime.getFullYear();
    // const month = currentDateandTime.getMonth() + 1;
    // const day = currentDateandTime.getDate();

    // const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    // const hours = currentDateandTime.getHours();
    // const minutes = currentDateandTime.getMinutes();
    // const seconds = currentDateandTime.getSeconds();

    // const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const { email, duration, formattedDate, formattedTime } = req.body;

    shiftModel.findOneAndUpdate({email:email,date:formattedDate} ,{
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

app.get("/checkShift", async (req,res)=>{
    // const {email,today} = req.body;
    const today = new Date().toISOString().split('T')[0];
    const email = req.params.email;
    try {
        const shift = await shiftModel.findOne({
            email: email,
            date: today
        });

        if (shift) {
            if (shift.duration === "0") {
                return res.json({ hasnt: true, startTime: shift.startTime });
            } else {
                return res.json("complete");
            }
        } else {
            const dlk = await apprvModel.findOne({
                email: email,
                startDate: { $lte: today },
                endDate: { $gte: today }
            })
            if(dlk){
                return res.json("free")
            }else{
                const user = await userModel.findOne({
                    email:email
                });
                if (user) {
                    switch (user.role) {
                        case "HR":
                            return res.json({ ScheduleStart: "08:00", ScheduleEnd: "17:00"});
    
                        case "satpam":
                            return res.json({ ScheduleStart: "07:00", ScheduleEnd: "19:00"});
    
                        case "free":
                            // return res.json({ ScheduleStart: "08:00", ScheduleEnd: "17:00"});
                            return res.json("free")
    
                        case "employee":
                            return res.json({ ScheduleStart: "08:00", ScheduleEnd: "17:00"});
    
                        case "ccp":
                            return res.json({ ScheduleStart: "07:50", ScheduleEnd: "20:00"}); 
    
                        default:
                            return res.json({ ScheduleStart: "19:50", ScheduleEnd: "08:00"});
                    }
                }
            }
        }
    } catch (err) {
        return res.json(err);
    }
});

app.get('/searchBy', async (req, res) => {
    const { startDate, endDate, empEmail } = req.query;
    try {
        const filter = {};
        if (empEmail) {
            filter.email = empEmail;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: startDate,
                $lte: endDate,
            }
        }
        const filteredData = await shiftModel.find(filter);
        res.json(filteredData);
    } catch (error) {
        res.json(error);
    }
});

app.get("/searchByEmp/:email", (req,res)=>{
    const email = req.params.email;
    shiftModel.find({email:email})
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.get("/getUser/:email", (req, res) =>{
    const email = req.params.email;
    userModel.findOne({email:email})
    .then(users=>res.json(users))
    .catch(err=>res.json(err))
})

app.get('/getAbsentAllEmployee', async (req,res)=>{
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const startOfTheMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const currentDate = new Date().toISOString().split('T')[0];
        const totalDaysInMonth = countWeekdays(new Date(startOfTheMonth), new Date(currentDate));

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startOfTheMonth,
                        $lte: currentDate
                    }
                }
            },
            {
                $group: {
                    _id: "$email", // Group by employee email
                    totalDays: { $sum: 1 } // For each shift, add 1
                }
            },
            {
                $project: {
                    absentDays: { $subtract: [totalDaysInMonth, "$totalDays"] } // Subtract totalDays from currentDay
                }
            },
            {
                $group: {
                    _id: null, // Group all records together
                    totalAbsentDays: { $sum: "$absentDays" } // Sum up all absent days
                }
            }
        ];

        const totalAbsences = await shiftModel.aggregate(pipeline);
        res.json(totalAbsences[0].totalAbsentDays)

    } catch (error) {
        console.error('Error:', error.message);
        res.json(error.message)
    }
})


app.get('/getAbsentEachEmployee', async (req,res)=>{
    try {
        const { startDate, endDate, empEmail } = req.query;
        const totalWorkDays = countWeekdays(new Date(startDate), new Date(endDate));

        const filter = {};
        if (empEmail) {
            filter.email = empEmail;
        }
        if (startDate && endDate) {
            filter.date = {
                $gte: startDate,
                $lte: endDate,
            }
        }
        const pipeline = [
            {
                $match: filter
            },
            {
                $group: {
                    _id: "$email", // Group by employee email
                    totalDays: { $sum: 1 } // For each shift, add 1
                }
            },
            {
                $project: {
                    _id: 0, // Exclude this from final output
                    email: "$_id", // Rename _id to email
                    absentDays: { $subtract: [totalWorkDays, "$totalDays"] } // Subtract totalDays from totalDaysInMonth
                }
            }
        ];

        const employeeAbsences = await shiftModel.aggregate(pipeline);
        res.json(employeeAbsences)
        } catch (error) {
            console.error('Error:', error.message);
            res.json(error.message)
        }
})

app.listen(3001, ()=>{
    console.log("Server is Running")
})