
const router = require('express').Router()
const path = require('path');
const scriptName = path.basename(__filename).replace('.js', '');
const { authenticateToken } = require('../middlewares/AuthMidlleware')

const Controller = require(`../controllers/${scriptName}`)()

router.route('/')
    .get(authenticateToken, Controller.getNotif)
    .put(authenticateToken, Controller.readNotif)

router.route('/push')
    .get(Controller.pushNotif)

    

module.exports = router