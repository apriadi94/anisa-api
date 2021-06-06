const notifService = require('../../service/notifService')


const Controller = () => {

    const pushNotif = async (req, res) => {
        await notifService.notifikasi()
        await notifService.checkPerkaraPBTbelumBHT()
        await notifService.checkPerkaraPBTbelumBHTPermohonan()
        res.json({message : 'sukses'})
    }

    const getNotif = async (req, res) => {
        const notif = await notifService.getPenerimaNotifbyId(req.user.id)
        res.send(notif)
    }

    const readNotif = async (req, res) => {
        await notifService.changeUnreadNotif(req.user.id)
        res.json({
            message : 'sukses'
        })
    }

    return { getNotif, pushNotif, readNotif }
}

module.exports = Controller