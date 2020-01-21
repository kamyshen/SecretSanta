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
    date: {
        type: Date,
        default: Date.now
    },
    zerodate: {
        type: Date,
        required: true
    },
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
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
