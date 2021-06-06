
const router = require('express').Router()
const path = require('path');
const scriptName = path.basename(__filename).replace('.js', '');

const Controller = require(`../controllers/${scriptName}`)()

router.route('/')
    .get(Controller.getJumlahData)

router.route('/get-chart')
    .get(Controller.getJumlahPerkaraTiapBulan)

router.route('/get-biaya')
    .get(Controller.getBiayaPerkara)

router.route('/status-sidang')
    .get(Controller.getStatusSidang)

router.route('/cek-sidang-besok')
    .get(Controller.checkSidang)
    

module.exports = router