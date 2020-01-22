const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session);

const app = express()

require('./config/passport')(passport)

const db = require('./config/keys').MongoURI
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log('Mongo DB connected...'))
    .catch(err => console.log(err))

app.use(expressLayouts)
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false}))
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))

app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.info = req.flash('info')
    res.locals.isAuthenticated = req.isAuthenticated()
    // res.locals.exchangeCode = req.flash('exchangeCode')
    next()
})

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const port = process.env.PORT || 5000
app.listen(port, console.log(`Server started on port ${port}`))
