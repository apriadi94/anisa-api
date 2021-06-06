const perkaraService = require('../../service/perkaraService')

const Controller = () => {
    const GetData = (req, res) => {
        const {tgl_sidang, user} = req.query
        perkaraService.getJadwalsidang(tgl_sidang)
            .then(result => {
                const NewData = user ? 
                    result.filter(item => item.perkara.panitera.panitera_nama === user)
                        .map(perkaraService.refactoryDataPihak) 
                    : result.map(perkaraService.refactoryDataPihak)
                res.json(NewData)
            })
    }

    return { GetData }
}

module.exports = Controller