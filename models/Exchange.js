const mongoose = require('mongoose')

const ExchangeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    giftDate: {
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
    },
    exchangeCode: {
        type: String,
        required: true,
        trim: true,
    }

})

const Exchange = mongoose.model('Exchange', ExchangeSchema)

module.exports = Exchange
