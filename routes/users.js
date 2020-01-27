const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const langOptions = require('../config/langOptions')

const User = require('../models/User')

router.get('/login', (req, res) => {
  if (res.locals.error[0] && res.locals.error[0] === 'That email is not registered') {
    if (req.session.locale === 'ru') {
      res.locals.error[0] = 'Такой email не зарегистрирован'
    }
  }
  if (res.locals.error[0] && res.locals.error[0] === 'Password incorrect') {
    if (req.session.locale === 'ru') {
      res.locals.error[0] = 'Неправильный пароль'
    }
  }
  res.render('login', langOptions.loginOptions(req))
})

router.get('/register', (req, res) => {
  res.render('register', langOptions.registerOptions(req))
})

router.get('/registerFirst', (req, res) => {
  if (req.session.locale === 'ru') {
    req.flash('info', 'Пожалуйста, сначала зарегистрируйтесь!')
  } else {
    req.flash('info', 'Please register first!')
  }
  res.redirect('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = []
  if (!name || !email || !password || !password2) {
    if (req.session.locale === 'ru') {
      errors.push({ msg: 'Пожалуйста, заполните все поля!'})
    } else {
      errors.push({ msg: 'Please fill in all fields!'})
    }
  }

  if (password !== password2) {
    if (req.session.locale === 'ru') {
      errors.push({msg: 'Пароли не совпадают'})
    } else {
      errors.push({msg: 'Passwords do not match'})
    }
  }
  if (password.length < 6) {
    if (req.session.locale === 'ru') {
      errors.push({ msg: 'Пароль должен быть длиной как минимум 6 символов'})
    } else {
      errors.push({ msg: 'Password should be at least 6 characters'})
    }
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      ...langOptions.registerOptions(req)
    })
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          if (req.session.locale === 'ru') {
            errors.push({ msg: 'Такой email уже зарегистрирован'})
          } else {
            errors.push({ msg: 'Email is already registered'})
          }
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            ...langOptions.registerOptions(req)
          })
        } else {
          const newUser = new User({
            name,
            email,
            password
          })
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err

              newUser.password = hash
              newUser.save()
                .then(user => {
                  if (req.session.locale === 'ru') {
                    req.flash('success_msg', 'Вы успешно зарегистрированы')
                  } else {
                    req.flash('success_msg', 'You are now registered and can log in')
                  }
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))
            }))
        }
      })
  }

})



router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logOut()
  req.session.exchangeCode = undefined
  if (req.session.locale === 'ru') {
    req.flash('success_msg', 'Вы вышли из своего аккаунта')
  } else {
    req.flash('success_msg', 'You are logged out')
  }
  req.session.locale = ''
  res.redirect('/')
})




module.exports = router
