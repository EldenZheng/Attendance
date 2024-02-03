const mongoose = require('mongoose')

const apprvSchema = new mongoose.Schema({
    email: String,
    approvalType: String,
    startDate: String,
    endDate: String,
    status: String
})

const apprvModel = mongoose.model("HRapproval",apprvSchema)
module.exports = apprvModel