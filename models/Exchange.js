const mongoose = require('mongoose')

const ExchangeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    start: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    participants: [
        {
           type: String
        }
    ],
    options: {
        priceCap: String,
        isParticipant: String
    },
    exchangeCode: {
        type: String,
        required: true,
        trim: true,
    }

})

const Exchange = mongoose.model('Exchange', ExchangeSchema)

module.exports = Exchange
