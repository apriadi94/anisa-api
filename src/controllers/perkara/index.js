const perkaraService = require('../../service/perkaraService')
const notifService = require('../../service/notifService')

const Controller = () => {

    const getJumlahData = async (req, res) => {
        const JumlahPerkaraGugatan = await perkaraService.getDataPerkara('%Pdt.G%')
        const JumlahPerkaraPermohonan = await perkaraService.getDataPerkara('%Pdt.P%')
    
         res.json({
             gugatan : JumlahPerkaraGugatan,
             permohonan : JumlahPerkaraPermohonan,
         })
    }

    const getStatusSidang = async (req, res) => {
        const data = await perkaraService.statusSidang()
        const dataStatusSidang = JSON.parse(data)
        res.send(dataStatusSidang)
    }

    const checkSidang = async (req, res) => {
        const dataSidang = await notifService.checkPerkaraPBTbelumBHT()
        res.send({
            tes : 'tes'
        })
    }

    const getJumlahPerkaraTiapBulan = async (req, res) => {
        const JumlahPerkaraTiapBulan = await perkaraService.getDataPerkaraTiapBulan()
        const objectBulan = JSON.parse(JumlahPerkaraTiapBulan)[0]
        const objectToArray = Object.values(objectBulan);

        res.send(objectToArray.filter(number => number > 1))
    }

    const getBiayaPerkara = async (req, res) => {
        const { perkara_id } = req.query
        const data = await perkaraService.dataBiayaPerkara(perkara_id)
        const dataBiaya = JSON.parse(data)
        res.send(dataBiaya)
    }

    return { getJumlahData, getJumlahPerkaraTiapBulan, getStatusSidang, checkSidang, getBiayaPerkara }
}

module.exports = Controller