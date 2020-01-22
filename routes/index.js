const express = require('express')
const router = express.Router()
const Exchange = require('../models/Exchange')
const User = require('../models/User')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')

router.get('/', (req, res) => {
    res.render('welcome')
})

router.get('/setup', (req, res) => {
    let current = new Date(Date.now()).toISOString().split('T')[0]
    req.session.formShow = true
    res.render('setup', { current })
})

router.get('/profile', ensureAuthenticated, async (req, res) => {
    const exchangeCode = req.session.exchangeCode
    let name = req.user.name

    const imOrganizer = Exchange.find({
        organizer: req.user.email
    })
    // console.log(imOrganizer)
    res.render('profile', {
        exchangeCode,
        name
    })
})

router.post('/setup', ensureAuthenticated, (req, res) => {
    const { name, giftDate, isParticipant, priceCap } = req.body
    let exchangeCode = Math.random().toString(36).substr(2, 5)
    let options = {
        priceCap: priceCap || undefined,
        isParticipant
    }
    const newExchange = new Exchange({
        name,
        giftDate,
        organizer: req.user.email,
        participants: [req.user.email],
        options,
        exchangeCode
    })
    newExchange.save()
        .then(ex => {
            req.session.exchangeCode = exchangeCode
            res.redirect('profile')
        })
        .catch(err => console.log(err))
})

router.get('/join', (req, res) => {
    res.render('join', {
        haveCode: false
    })
})

router.post('/join', async (req, res) => {
    try {
        const email = req.user.email
        const participant = await Exchange.find({ participants: email })
        if (participant.length != 0) {
            res.render('join', {
                haveCode: false,
                success_msg: 'You are already signed up for this exchange!'
            })
            return
        }
        await Exchange.findOneAndUpdate( {exchangeCode: req.session.exchangeCode}, { $push: {participants: email} } )
        req.flash('success_msg', 'You successfully signed up for this exchange!')
        res.render('join', {
            haveCode: false,
            success_msg: 'You successfully signed up for this exchange!'
        })
    } catch(err) { console.log(err) }

})

router.post('/code', async (req, res) => {
    try {
        const code = req.body.code
        const exchange = await Exchange.findOne({ exchangeCode: code} )
        if (!exchange) {
            req.flash('error', 'Could not find an exchange with such a code')
            res.redirect('join')
            return
        }
        const author = await User.findOne( {email: exchange.organizer} )
        const count = exchange.participants.length
        res.render('join', {
            author: author.name,
            giftDate: exchange.giftDate,
            priceCap: exchange.options.priceCap,
            count,
            haveCode: true
        })
    } catch(err) { console.log(err) }
})


module.exports = router


