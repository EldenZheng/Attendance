const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userModel = require('./models/Users.model')
const shiftModel = require('./models/Attendance.models')
const apprvModel = require('./models/Approval.model')

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

    const { email, onTime, selectedOption } = req.body;
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
        start_date: startDate,
        end_date: endDate
    })
    .then(shift=>res.json(shift))
    .catch(err=>res.json(err))
})

app.put("/EndShift", (req, res) =>{
    const currentDateandTime = new Date();
    const year = currentDateandTime.getFullYear();
    const month = currentDateandTime.getMonth() + 1;
    const day = currentDateandTime.getDate();

    const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    const hours = currentDateandTime.getHours();
    const minutes = currentDateandTime.getMinutes();
    const seconds = currentDateandTime.getSeconds();
    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const { email, duration } = req.body;

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

app.get("/checkShift/:email", async (req,res)=>{
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
        console.log(filter)
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
        const nextMonth = new Date().getMonth() + 2;
        const currentYear = new Date().getFullYear();
        const startOfTheMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const startOfTheNextMonth = `${currentYear}-${String(nextMonth).padStart(2, '0')}-01`;
        console.log(startOfTheMonth+", "+startOfTheNextMonth)
        
        // Find clock-in records for the current month
        const absentEmployees = await shiftModel.find({
            date: {
                $gte: new Date(startOfTheMonth).toISOString().split('T')[0],
                $lte: new Date(startOfTheNextMonth).toISOString().split('T')[0]
            },
            $expr: {
                $and: [
                    { $eq: [{ $month: "$date" }, currentMonth] },
                    { $ne: [{ $dayOfWeek: "$date" }, 1] }, // Exclude Sunday (1)
                    { $ne: [{ $dayOfWeek: "$date" }, 7] }  // Exclude Saturday (7)
                ]
            }
        });
        console.log(absentEmployees)

        // Find all employees
        const allEmployees = await userModel.find({});

        // Identify absent employees
        const presentEmployeeIds = absentEmployees.map(entry => entry.email.toLowerCase());
        console.log("presentEmployeeIds:"+presentEmployeeIds)
        const absentEmployeeQuantity = allEmployees.filter(employee => !presentEmployeeIds.includes(employee.email)).length;
        console.log("absentEmployeeQuantity: "+absentEmployeeQuantity)
        res.json(absentEmployeeQuantity)
    } catch (error) {
        console.error('Error:', error.message);
        res.json(error.message)
    }
})

app.get('/getAbsentEachEmployee', async (req,res)=>{
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
    
        // Find all employees
        const allEmployees = await userModel.find({});
    
        // Initialize an object to track absent days for each employee
        const absentDaysMap = {};
    
        // Find clock-in records for the current month
        const absentEmployees = await shiftModel.find({
            date: {
                $gte: new Date(currentYear, currentMonth - 1, 1),  // Start of the current month
                $lt: new Date(currentYear, currentMonth, 1)  // Start of the next month
            },
            $expr: {
                $and: [
                    { $eq: [{ $month: "$date" }, currentMonth] },
                    { $nin: [{ $dayOfWeek: "$date" }, 1, 7] }  // Exclude Sunday (1) and Saturday (7)
                ]
            }
        });
    
        // Populate the absentDaysMap with absent days for each employee
        absentEmployees.forEach(entry => {
            const email = entry.email;
            if (!absentDaysMap[email]) {
                absentDaysMap[email] = 1;
            } else {
                absentDaysMap[email]++;
            }
        });
          // Display the result
        allEmployees.forEach(employee => {
            const email = employee.email;
            const absentDays = absentDaysMap[email] || 0;
            const absentData = `${employee.email}: ${absentDays} day(s) absent`;
            res.json(absentData)
        });
        } catch (error) {
            console.error('Error:', error.message);
            res.json(error.message)
        }
})

app.listen(3001, ()=>{
    console.log("Server is Running")
})