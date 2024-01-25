const mongoose = require('mongoose')

const AttendanceSchema = new mongoose.Schema({
    email: String,
    date: String,
    startTime: String,
    duration: String,
    endTime: String,
    stat: String
})

const shiftModel = mongoose.model("Shift",AttendanceSchema)
module.exports = shiftModel