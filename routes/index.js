const express = require('express')
const router = express.Router()
const Exchange = require('../models/Exchange')
const { ensureAuthenticated } = require('../config/auth')
const { shuffleArray } = require('../config/randomize')
const langOptions = require('../config/langOptions')
const Intl = require('intl')

router.get('/', (req, res) => {
    if (!req.session.locale) {
        req.session.locale = req.headers["accept-language"].slice(0,2)
    }
    res.render('welcome', langOptions.welcomeOptions(req))
})

router.get('/setup', ensureAuthenticated, (req, res) => {
    let current = new Date(Date.now()).toISOString().split('T')[0]
    req.session.formShow = true
    res.render('setup', {
        current,
        ...langOptions.setupOptions(req)
    })
})

router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user._id
        const name = req.user.name
        const exchangeCode = req.session.exchangeCode

        const exchangeOrgPromise = Exchange.find({ organizer: user }).populate('participants')
        const exchangePartPromise = Exchange.find({ participants: user }).populate('organizer participants')
        const [exchangeOrg, exchangePart] = await Promise.all([exchangeOrgPromise, exchangePartPromise])

        const isOrganizer = exchangeOrg.length !== 0
        const isParticipant =  exchangePart.length !== 0

        let org
        if (req.session.locale === 'ru') {
            org = 'Вы'
        } else {
            org = 'You'
        }

        function dateToLocale(date) {
            if (req.session.locale === 'ru') {
                return new Intl.DateTimeFormat('ru-RU', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }).format(date)
            } else {
                return new Intl.DateTimeFormat('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }).format(date)
            }
        }

        const DataOrganizer = []
        exchangeOrg.forEach(ex => {
            const participants = ex.participants.map(o => o.name === req.user.name ? org : o.name).sort()
            const priceCap = ex.options.priceCap || undefined
            const randomized = ex.randomized

            DataOrganizer.push({
                giftDate: dateToLocale(ex.giftDate),
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
                giftDate: dateToLocale((ex.giftDate)),
                count: ex.participants.length,
                priceCap,
                target,
                organizer: ex.organizer.name === req.user.name ? org : ex.organizer.name
            })
        })
        res.render('profile', {
            name,
            isOrganizer,
            isParticipant,
            DataOrganizer,
            DataParticipant,
            exchangeCode,
            ...langOptions.profileOptions(req)
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
        haveCode: false,
        ...langOptions.joinOptions(req)
    })
})

router.post('/join', ensureAuthenticated, async (req, res) => {
    try {
        const participant = await Exchange.find({ participants: req.user._id, exchangeCode: req.session.exchangeCode } )
        if (participant.length !== 0) {
            let alreadyMes = ''
            if (req.session.locale === 'ru') {
                alreadyMes = 'Вы уже участвуете в данном обмене!'
            } else {
                alreadyMes = 'You are already signed up for this exchange!'
            }
            res.render('join', {
                haveCode: false,
                success_msg: alreadyMes,
                ...langOptions.joinOptions(req)
            })
            return
        }
        await Exchange.findOneAndUpdate( {exchangeCode: req.session.exchangeCode}, { $push: {participants: req.user._id} } )
        let sucMes = ''
        if (req.session.locale === 'ru') {
            sucMes = 'Вы успешно присоединились к данному обмену!'
        } else {
            sucMes = 'You successfully signed up for this exchange!'
        }
        res.render('join', {
            haveCode: false,
            success_msg: sucMes,
            ...langOptions.joinOptions(req)
        })
    } catch(err) { console.log(err) }

})

router.post('/code', ensureAuthenticated, async (req, res) => {
    try {
        req.session.exchangeCode = req.body.code
        const exchange = await Exchange.findOne({ exchangeCode: req.body.code} ).populate('organizer')
        if (!exchange) {
            if (req.session.locale === 'ru') {
                req.flash('error', 'Обмен подарками с таким кодом не найден')
            } else {
                req.flash('error', 'Could not find an exchange with such a code')
            }
            res.redirect('join')
            return
        }
        if (!exchange.randomized) {
            let org
            if (req.session.locale === 'ru') {
                org = 'Вы'
            } else {
                org = 'You'
            }
            const author = req.user.name === exchange.organizer.name ? org : exchange.organizer.name
            const count = exchange.participants.length
            res.render('join', {
                author,
                giftDate: exchange.giftDate,
                priceCap: exchange.options.priceCap,
                count,
                haveCode: true,
                ...langOptions.joinOptions(req)
            })
        } else {
            if (req.session.locale === 'ru') {
                req.flash('error', 'Извините, но вы уже не можете присоединиться: организатор перешел к следующему этапу этого обмена')
            } else {
                req.flash('error', 'Sorry, but it is too late to join this exchange. The organizer has already randomized the participants')
            }
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

router.get('/lang/:lang', (req, res) => {
    req.session.locale = req.params.lang
    res.redirect('back')
})

module.exports = router


