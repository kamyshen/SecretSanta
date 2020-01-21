const express = require('express')
const router = express.Router()
const Exchange = require('../models/Exchange')
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
    let exchangeCode = req.session.exchangeCode
    let name = req.user.name

    const imOrganizer = Exchange.find({
        organizer: req.user.email
    })
    // const imInExchange = Exchange.find({
    //
    // })
    console.log(imOrganizer)
    res.render('profile', {
        exchangeCode,
        name
    })
})

router.get('/profile:exchangeCode', (req, res) => {
    res.send('\'/profile:exchangeCode\'')
})

router.post('/setup', ensureAuthenticated, (req, res) => {
    const { name, date, isParticipant, priceCap } = req.body
    let exchangeCode = Math.random().toString(36).substr(2, 5)
    let options = {
        priceCap: priceCap || undefined,
        isParticipant
    }
    const newExchange = new Exchange({
        name,
        zerodate: date,
        organizer: req.user.email,
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


module.exports = router


