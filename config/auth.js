module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    if (req.session.locale === 'ru') {
      req.flash('error_msg', 'Пожалуйста, сначала залогиньтесь')
    } else {
      req.flash('error_msg', 'Please log in first')
    }
    res.redirect('/users/login')
  }
}
