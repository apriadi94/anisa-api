
const router = require('express').Router()
const path = require('path');
const scriptName = path.basename(__filename).replace('.js', '');
const { authenticateToken } = require('../middlewares/AuthMidlleware')

const Controller = require(`../controllers/${scriptName}`)()

router.route('/')
    .get(authenticateToken, Controller.getMyUser)
    .post(Controller.signUp)

router.route('/nik')
    .post(Controller.signInWithNik)

router.route('/token')
    .put(authenticateToken, Controller.updateTokenNotif)

router.route('/signin')
    .post(Controller.signIn)

router.route('/sipp')
    .get(Controller.getSippUsers)

router.route('/sipp/:id')
    .get(authenticateToken, Controller.getUserSippByid)
    

module.exports = router
