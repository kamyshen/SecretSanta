
exports.registerOptions = (req) => {
  return {
    register: req.i18n.__('register'),
    username: req.i18n.__('username'),
    emailAddress: req.i18n.__('emailAddress'),
    pass: req.i18n.__('pass'),
    confPass: req.i18n.__('confPass'),
    register: req.i18n.__('register'),
    haveAcc: req.i18n.__('haveAcc'),
  }
}

exports.loginOptions = (req) => ({
  login: req.i18n.__('login'),
  em: req.i18n.__('em'),
  enterEm: req.i18n.__('enterEm'),
  pass: req.i18n.__('pass'),
  enterPas: req.i18n.__('enterPas'),
  noAcc: req.i18n.__('noAcc'),
  register: req.i18n.__('register')
})


exports.welcomeOptions = (req) => ({
  title: req.i18n.__("title"),
  btnWork: req.i18n.__("How does this site work?"),
  desc1: req.i18n.__('description1'),
  desc2: req.i18n.__('description2'),
  howThisWorks1: req.i18n.__('how1'),
  howThisWorks2: req.i18n.__('how2'),
  howThisWorks3: req.i18n.__('how3'),
  howThisWorks4: req.i18n.__('how4'),
  howThisWorks5: req.i18n.__('how5'),
  howThisWorks6: req.i18n.__('how6'),
  howThisWorks7: req.i18n.__('how7'),
  howThisWorks8: req.i18n.__('how8'),
  howThisWorks9: req.i18n.__('how9'),
  close: req.i18n.__('close'),
  setupNew: req.i18n.__('setup'),
  iHaveANewCode: req.i18n.__('code')
})

exports.setupOptions = (req) => ({
  titleExchange: req.i18n.__('titleExchange'),
  nameExchange: req.i18n.__('nameExchange'),
  DateExchange: req.i18n.__('DateExchange'),
  youParticipate: req.i18n.__('youParticipate'),
  limitExchange: req.i18n.__('limitExchange'),
  priceCap: req.i18n.__('priceCap'),
  setupExchange: req.i18n.__('setupExchange'),
})

exports.joinOptions = (req) => ({
  join: req.i18n.__('join'),
  putInCode: req.i18n.__('putInCode'),
  submit: req.i18n.__('submit'),
  createdBy: req.i18n.__('createdBy'),
  giftgivingDay: req.i18n.__('giftgivingDay'),
  participantsNum: req.i18n.__('participantsNum'),
  priceCapfor: req.i18n.__('priceCapfor'),
  joinBtn: req.i18n.__('joinBtn'),
})

exports.profileOptions = (req) => ({
  welcome: req.i18n.__('welcome'),
  youSetupANew: req.i18n.__('youSetupANew'),
  ExchangesYouCreated: req.i18n.__('ExchangesYouCreated'),
  giftgivingDay: req.i18n.__('giftgivingDay'),
  participantsNum: req.i18n.__('participantsNum'),
  exchangeCodetext: req.i18n.__('exchangeCodetext'),
  priceCapfor: req.i18n.__('priceCapfor'),
  randomize: req.i18n.__('randomize'),
  cannotUndone: req.i18n.__('cannotUndone'),
  beenRandomized: req.i18n.__('beenRandomized'),
  youSignedupfor: req.i18n.__('youSignedupfor'),
  createdBy: req.i18n.__('createdBy'),
  YouPreparingFor: req.i18n.__('YouPreparingFor'),
})

