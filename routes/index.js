const express = require('express')
const router = express.Router()
const Exchange = require('../models/Exchange')
const User = require('../models/User')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')
const { shuffleArray } = require('../config/randomize')

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
        const exchangePartPromise = Exchange.find({ participants: user }).populate('organizer participants')
        const [exchangeOrg, exchangePart] = await Promise.all([exchangeOrgPromise, exchangePartPromise])

        const isOrganizer = exchangeOrg.length != 0
        const isParticipant =  exchangePart.length != 0

        const DataOrganizer = []
        exchangeOrg.forEach(ex => {
            const participants = ex.participants.map(o => o.name === req.user.name ? 'YOU' : o.name)
            const priceCap = ex.options.priceCap || undefined
            const randomized = ex.randomized
            DataOrganizer.push({
                giftDate: ex.giftDate.toLocaleDateString(),
                exchangeCode: ex.exchangeCode,
                participants,
                priceCap,
                randomized
            })
        })

        const DataParticipant = []
        exchangePart.forEach(ex => {
            const priceCap = ex.options.priceCap || undefined
            let target
            if (ex.randomized) {
                const participants = ex.participants.map(p => p._id)
                const targetIndex = participants.indexOf(req.user._id) !== participants.length - 1
                ? participants.indexOf(req.user._id) + 1 : 0
                target = ex.participants[targetIndex].name
            }
            DataParticipant.push({
                giftDate: ex.giftDate.toLocaleDateString(),
                count: ex.participants.length,
                priceCap,
                target,
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
        if (!exchange.randomized) {
            const author = req.user.name === exchange.organizer.name ? 'YOU' : exchange.organizer.name
            const count = exchange.participants.length
            res.render('join', {
                author,
                giftDate: exchange.giftDate,
                priceCap: exchange.options.priceCap,
                count,
                haveCode: true
            })
        } else {
            req.flash('error', 'Sorry, but it is too late to join this exchange. The organizer has already randomized the participants')
            res.redirect('join')
            return
        }

    } catch(err) { console.log(err) }
})

router.post('/randomize', ensureAuthenticated, async (req, res) => {
    try {
        const codeToRandom = req.body.codeToRandom
        const exchangeToRandom = await Exchange.findOne({
            exchangeCode: codeToRandom
        }).populate('participants')

        if (!exchangeToRandom.randomized) {
            const arrToRand = exchangeToRandom.participants
            shuffleArray((arrToRand))
            await Exchange.findOneAndUpdate({exchangeCode: codeToRandom}, { $set: {participants: arrToRand, randomized: true}})
        }
        res.redirect('/profile')
    } catch (err) { console.log(err) }


})


module.exports = router


