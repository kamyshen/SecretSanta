const express = require('express')
const router = express.Router()
const Exchange = require('../models/Exchange')
const User = require('../models/User')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')

router.get('/', (req, res) => {
    res.render('welcome')
})

router.get('/setup', ensureAuthenticated, (req, res) => {
    let current = new Date(Date.now()).toISOString().split('T')[0]
    req.session.formShow = true
    res.render('setup', { current })
})

router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user._id
        const name = req.user.name
        const exchangeCode = req.session.exchangeCode

        const exchangeOrgPromise = Exchange.find({ organizer: user }).populate('participants')
        const exchangePartPromise = Exchange.find({ participants: user }).populate('organizer')
        const [exchangeOrg, exchangePart] = await Promise.all([exchangeOrgPromise, exchangePartPromise])

        const isOrganizer = exchangeOrg.length != 0
        const isParticipant =  exchangePart.length != 0

        const DataOrganizer = []
        exchangeOrg.forEach(ex => {
            const participants = ex.participants.map(o => o.name === req.user.name ? 'YOU' : o.name)
            const priceCap = ex.options.priceCap || undefined
            DataOrganizer.push({
                giftDate: ex.giftDate.toLocaleDateString(),
                exchangeCode: ex.exchangeCode,
                participants,
                priceCap
            })
        })

        const DataParticipant = []
        exchangePart.forEach(ex => {
            const priceCap = ex.options.priceCap || undefined
            DataParticipant.push({
                giftDate: ex.giftDate.toLocaleDateString(),
                count: ex.participants.length,
                priceCap,
                organizer: ex.organizer.name === req.user.name ? 'YOU' : ex.organizer.name
            })
        })
        res.render('profile', {
            name,
            isOrganizer,
            isParticipant,
            DataOrganizer,
            DataParticipant,
            exchangeCode
        })
    } catch(err) { console.log(err) }

})

router.post('/setup', ensureAuthenticated, (req, res) => {
    const { name, giftDate, isParticipant, priceCap } = req.body
    let exchangeCode = Math.random().toString(36).substr(2, 5)
    let options = {
        priceCap: priceCap || undefined,
    }
    const newExchange = new Exchange({
        name,
        giftDate,
        organizer: req.user._id,
        ...(isParticipant && {participants: [req.user._id]}),
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

router.get('/join', ensureAuthenticated, (req, res) => {
    res.render('join', {
        haveCode: false
    })
})

router.post('/join', ensureAuthenticated, async (req, res) => {
    try {
        const participant = await Exchange.find({ participants: req.user._id, exchangeCode: req.session.exchangeCode } )
        if (participant.length != 0) {
            res.render('join', {
                haveCode: false,
                success_msg: 'You are already signed up for this exchange!'
            })
            return
        }
        await Exchange.findOneAndUpdate( {exchangeCode: req.session.exchangeCode}, { $push: {participants: req.user._id} } )
        req.flash('success_msg', 'You successfully signed up for this exchange!')
        res.render('join', {
            haveCode: false,
            success_msg: 'You successfully signed up for this exchange!'
        })
    } catch(err) { console.log(err) }

})

router.post('/code', ensureAuthenticated, async (req, res) => {
    try {
        req.session.exchangeCode = req.body.code
        const exchange = await Exchange.findOne({ exchangeCode: req.body.code} ).populate('organizer')
        if (!exchange) {
            req.flash('error', 'Could not find an exchange with such a code')
            res.redirect('join')
            return
        }
        const author = req.user.name === exchange.organizer.name ? 'YOU' : exchange.organizer.name
        const count = exchange.participants.length
        res.render('join', {
            author,
            giftDate: exchange.giftDate,
            priceCap: exchange.options.priceCap,
            count,
            haveCode: true
        })
    } catch(err) { console.log(err) }
})


module.exports = router


