const ModelNisa = require('../models/nisa')
const ModelSipp = require('../models/sipp')
const perkaraService = require('./perkaraService')
const userService = require('./userService')
const moment = require('moment')

const {kirimNotification, KirimNotifLangsung} = require('./notifHelpers/kirimNotif')

const hitToPenetapan = async (notif_id, perkaraId, otoritas, table, fields, tentang, deskripsi) => {
    const users = await ModelSipp.sequelize.query(`
        SELECT a.perkara_id, a.${fields}, b.nomor_perkara FROM ${table} a 
        LEFT JOIN perkara b ON a.perkara_id = b.perkara_id
        WHERE a.perkara_id = ${perkaraId}
    `)
    
    for(const item of users[0]){
        const userNisa = await ModelNisa.User.findOne({where : { otoritas, user_id : item[fields] }})
        if(userNisa && userNisa.token_notif !== ''){
            const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
                where : {
                    notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Perkara Baru'
                }
            })
            if(checkPenerimaNotif === 0){
                ModelNisa.PenerimaNotif.create({
                    tanggal : moment(new Date()).format('YYYY-MM-DD'),
                    notif_id,
                    user_id : userNisa.id,
                    token_notif : userNisa.token_notif,
                    tentang,
                    deskripsi : `${deskripsi} Nomor ${item.nomor_perkara}`,
                    screen : '-'
                })
            }
        }
    }
}

const perintahTojurusita = async (data, notif_id, action) => {
    const dataJurusita = await ModelSipp.Jurusita.findOne({ where :  data.perkara_id })
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'jurusita', user_id : dataJurusita.jurusita_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : `Perintah Pemanggilan Sidang ${action === 'phs' ? 'Pertama' : `Ke ${data.urutan}`}`
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : `Perintah Pemanggilan Sidang ${action === 'phs' ? 'Pertama' : `Ke ${data.urutan}`}`,
                deskripsi : `Perintah Pemanggilan Sidang ${action === 'phs' ? 'Pertama' : `Ke ${data.urutan}`} ${data.nomor_perkara}`,
                screen : '-'
            })
        }
    }
}

const sidangToPihak = async (data, notif_id, action) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'pihak', user_id : data.perkara_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : `Pemberitahuan Sidang ${action === 'phs' ? 'Pertama' : `Ke ${data.urutan}`}`
            }
        }).catch(e => console.log(e))

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : `Pemberitahuan Sidang ${action === 'phs' ? 'Pertama' : `Ke ${data.urutan}`}`,
                deskripsi : `${data.nomor_perkara}, tanggal sidang ${action === 'phs' ? 'pertama' : `Ke ${data.urutan}`} anda adalah: ${moment(data.tanggal_sidang).format('dddd, DD MMMM YYYY')}`,
                screen : '-'
            })
        }

    }
}


const hitPhs = async (notif_id, perkara_id) => {
    const dataPhs = await ModelSipp.sequelize.query(`
        SELECT a.perkara_id, a.tanggal_sidang, b.nomor_perkara, b.pihak1_text, b.pihak2_text, b.alur_perkara_nama, b.jenis_perkara_nama
        FROM perkara_penetapan_hari_sidang a
        LEFT JOIN v_perkara b ON a.perkara_id = b.perkara_id
        WHERE a.perkara_id = ${perkara_id}
        ORDER BY a.id ASC LIMIT 1
    `)

    const dataPerkara = {
        perkara : {
            alur_perkara_nama : dataPhs[0][0].alur_perkara_nama,
            jenis_perkara_nama : dataPhs[0][0].jenis_perkara_nama,
            pihak1_text : dataPhs[0][0].pihak1_text,
            pihak2_text : dataPhs[0][0].pihak2_text,
        }
    }

    const pihak = perkaraService.refactoryDataPihak(dataPerkara).pihak
    const newPihak = []
    pihak.forEach(user => {
        if(typeof user === 'object'){
            user.forEach(arrUser => {
                newPihak.push(arrUser.replace(': .', ': '))
            })
        }else{
            newPihak.push(user)
        }
    });

    dataPhs[0][0].para_pihak = newPihak
    await perintahTojurusita(dataPhs[0][0], notif_id, 'phs')
    await sidangToPihak(dataPhs[0][0], notif_id, 'phs')
 
}


const hitTundaan = async (notif_id, perkara_id) => {
    const dataTundaan = await ModelSipp.sequelize.query(`
        SELECT a.perkara_id, a.tanggal_sidang, a.urutan, b.nomor_perkara, b.pihak1_text, b.pihak2_text, b.alur_perkara_nama, b.jenis_perkara_nama
        FROM perkara_jadwal_sidang a
        LEFT JOIN v_perkara b ON a.perkara_id = b.perkara_id
        WHERE a.perkara_id = ${perkara_id}
        ORDER BY a.id DESC LIMIT 1
    `)

    await perintahTojurusita(dataTundaan[0][0], notif_id, 'tundaan')
    await sidangToPihak(dataTundaan[0][0], notif_id, 'tundaan')
}


const putusToPihak = async (data, notif_id) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'pihak', user_id : data.perkara_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : `Pemberitahuan Perkara Putus`
            }
        })

        if(checkPenerimaNotif === 0){
            let deskripsi;
            if(data.jenis_perkara_text === 'Cerai Talak'){
                deskripsi = `${data.nomor_perkara} telah putus, silahkan tunggu untuk Panggilan Sidang Ikrar`
            }else{
                deskripsi = `${data.nomor_perkara} telah putus, silahkan ambil Sisa Panjar`
            }
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang :  `Pemberitahuan Perkara Putus`,
                deskripsi,
                screen : '-'
            })
        }
    }
}

const putusToPegawai = async (data, notif_id, otoritas, user_id) => {
    let tentang = ''
    let deskripsi = ''
    let screen = ''

    if(otoritas === 'jurusita'){
        tentang = `Perintah Pemberitahuan Isi Putusan`
        deskripsi = `Perintah untuk memberitahukan isi putusan kepada perkara nomor ${data.nomor_perkara}`
        screen = '-'
    }
    if(otoritas === 'panitera'){
        tentang = `Perintah Mengisi Data Putusan`
        deskripsi = `Perintah untuk mengisi amar putusan dan upload e-dok putusan ${data.nomor_perkara}`
        screen = '-'
    }
    if(otoritas === 'kasir'){
        tentang = `Perintah Mengisi Biaya Perkara Putus`
        deskripsi = `Perintah untuk mengisi data biaya redaksi dan materai untuk perkara nomor ${data.nomor_perkara}`
        screen = '-'
    }
    const userNisa = await ModelNisa.User.findOne({where : { otoritas, user_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang,
                deskripsi,
                screen
            })
        }
    }
}


const hitPutusan = async (notif_id, perkara_id) => {
    const dataPutusan = await ModelSipp.sequelize.query(`
        SELECT 
        a.perkara_id, a.nomor_perkara, a.jenis_perkara_text, a.tanggal_putusan, a.panitera_pengganti_id, a.jurusita_id, a.majelis_hakim_id,
        b.sisa
        FROM v_perkara a 
        LEFT JOIN v_perkara_biaya b ON a.perkara_id = b.perkara_id 
        WHERE a.perkara_id = ${perkara_id}
    `)

    await putusToPihak(dataPutusan[0][0], notif_id)
    await putusToPegawai(dataPutusan[0][0], notif_id, 'jurusita', dataPutusan[0][0].jurusita_id)
    await putusToPegawai(dataPutusan[0][0], notif_id, 'panitera', dataPutusan[0][0].panitera_pengganti_id)
    await putusToPegawai(dataPutusan[0][0], notif_id, 'kasir', 1000)
}


const hitEdok = async (notif_id, perkara_id) => {
    const dataPutusan = await ModelSipp.sequelize.query(`
        SELECT 
        a.perkara_id, a.nomor_perkara, a.tanggal_putusan, a.panitera_pengganti_id
        FROM v_perkara a 
        LEFT JOIN v_perkara_biaya b ON a.perkara_id = b.perkara_id 
        WHERE a.perkara_id = ${perkara_id}
    `)

    const perkaraPutusan = dataPutusan[0][0]

    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'panitera', user_id : perkaraPutusan.panitera_pengganti_id }})
    
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Input Minutasi'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Pemberitahuan Input Minutasi',
                deskripsi : `Pemberitahuan data perkara untuk diminutasi dengan nomor perkara : ${perkaraPutusan.nomor_perkara}`,
                screen : '-'
            })
        }
    }
}

const hitPmhIkrar = async (notif_id, perkara_id) => {
    const dataPMHIkrar = await ModelSipp.sequelize.query(`
        SELECT 
        a.perkara_id, a.nomor_perkara, b.majelis_hakim_id
        FROM v_perkara a 
        LEFT JOIN perkara_ikrar_talak b ON a.perkara_id = b.perkara_id
        WHERE a.perkara_id = ${perkara_id}
    `)

    const perkaraIkrar = dataPMHIkrar[0][0]
    const idMajelis = perkaraIkrar.majelis_hakim_id.split(',')

    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'hakim', user_id : idMajelis[0] }})
    
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Input PHS Ikrar'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Pemberitahuan Input PHS Ikrar',
                deskripsi : `Pemberitahuan data perkara untuk diisi PHS Ikrar dengan nomor perkara : ${perkaraIkrar.nomor_perkara}`,
                screen : '-'
            })
        }
    }
}

const phsIkrarToJurusita = async (data, notif_id, user_id) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'jurusita', user_id }})

    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Perintah Pemanggilan Sidang Ikrar'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Perintah Pemanggilan Sidang Ikrar',
                deskripsi : `Perintah Pemanggilan Sidang Ikrar dengan nomor perkara : ${data.nomor_perkara}`,
                screen : '-'
            })
        }
    }
}

const phsIkrarToPihak = async (data, notif_id, user_id) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'pihak', user_id }})

    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Tanggal Sidang Ikrar'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Pemberitahuan Tanggal Sidang Ikrar',
                deskripsi : `Pemberitahuan Tanggal Sidang Ikrar dengan nomor perkara : ${data.nomor_perkara} tanggal : ${moment(data.tgl_ikrar_talak).format('dddd, DD/MM/YYYY')}`,
                screen : '-'
            })
        }
    }
}

const hitPhsIkrar = async (notif_id, perkara_id) => {
    const dataPhsIkrar = await ModelSipp.sequelize.query(`
        SELECT 
        a.perkara_id, a.nomor_perkara, b.jurusita_id, b.tgl_ikrar_talak
        FROM v_perkara a 
        LEFT JOIN perkara_ikrar_talak b ON a.perkara_id = b.perkara_id
        WHERE a.perkara_id = ${perkara_id}
    `)

    const perkaraIkrar = dataPhsIkrar[0][0]

    await phsIkrarToJurusita(perkaraIkrar, notif_id, perkaraIkrar.jurusita_id)
    await phsIkrarToPihak(perkaraIkrar, notif_id, perkaraIkrar.perkara_id)
}

const mediasiToPihak = async (data, notif_id, user_id) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'pihak', user_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Pelaksanaan Mediasi'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Pemberitahuan Pelaksanaan Mediasi',
                deskripsi : `Pemberitahuan pelaksanaan mediasi`,
                screen : '-'
            })
        }
    }
}

const mediasiHakimMediator = async (data, notif_id, user_id) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : 'hakim', user_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang : 'Pemberitahuan Pelaksanaan Mediasi'
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang : 'Pemberitahuan Pelaksanaan Mediasi',
                deskripsi : `Pemberitahuan pelaksanaan mediasi nomor perkara : ${data.nomor_perkara}`,
                screen : '-'
            })
        }
    }
}

const hitMediasi = async (notif_id, perkara_id) => {
    const dataMediasi = await ModelSipp.sequelize.query(`
        SELECT a.perkara_id, c.hakim_id, d.nomor_perkara
        FROM perkara_mediasi a
        LEFT JOIN perkara_jadwal_mediasi b ON a.mediasi_id = b.mediasi_id
        LEFT JOIN mediator c ON a.mediator_id = c.id
        LEFT JOIN perkara d ON a.perkara_id = d.perkara_id
        WHERE a.perkara_id = ${perkara_id}
    `)

    const perkaraMediasi = dataMediasi[0][0]

    await mediasiToPihak(perkaraMediasi, notif_id, perkaraMediasi.perkara_id)
    await mediasiHakimMediator(perkaraMediasi, notif_id, perkaraMediasi.hakim_id)
}

const bhtTo = async (notif_id, otoritas, user_id, tentang, deskripsi, screen) => {
    const userNisa = await ModelNisa.User.findOne({where : { otoritas : otoritas, user_id }})
    if(userNisa && userNisa.token_notif !== ''){
        const checkPenerimaNotif = await ModelNisa.PenerimaNotif.count({
            where : {
                notif_id, user_id : userNisa.id, tentang
            }
        })

        if(checkPenerimaNotif === 0){
            ModelNisa.PenerimaNotif.create({
                tanggal : moment(new Date()).format('YYYY-MM-DD'),
                notif_id,
                user_id : userNisa.id,
                token_notif : userNisa.token_notif,
                tentang,
                deskripsi,
                screen
            })
        }
    }
}

const hitBHT = async (notif_id, perkara_id) => {
    const dataBHT = await ModelSipp.sequelize.query(`
        SELECT a.perkara_id, a.nomor_perkara, a.panitera_pengganti_id, alur_perkara_nama
        FROM v_perkara a
        WHERE perkara_id = ${perkara_id}
    `)

    const perkaraBHT = dataBHT[0][0]
    if(perkaraBHT.alur_perkara_nama === 'Perdata Gugatan'){
        await bhtTo(notif_id, 'panitera', 18, 'Pemberitahuan Untuk Pembuatan Akta Cerai', `Pemberitahuan untuk pembuatan akta cerai nomor perkara ${perkaraBHT.nomor_perkara}`, '-')
        await bhtTo(notif_id, 'pihak', perkaraBHT.perkara_id, 'Pemberitahuan Perkara Berkekuatan Hukum Tetap', `Pemberitahuan perkara telah BHT nomor perkara ${perkaraBHT.nomor_perkara}`, '-')
    }
}

exports.notifikasi = async () => {
    const notif = await ModelNisa.Notif.findAll({where : { status : 0 }})
    for(const item of notif){
        if(item.tentang === 'Perkara Baru'){
            //
        }
        if(item.tentang === 'PMH'){
            const tentang = 'Pemberitahuan Perkara Baru'
            const deskripsi = 'Anda Mendapatkan Perkara Baru Nomor '
            await hitToPenetapan(item.id, item.perkara_id, 'hakim', 'perkara_hakim_pn', 'hakim_id', tentang, deskripsi)
        }
        if(item.tentang === 'PPP'){
            const tentang = 'Pemberitahuan Perkara Baru'
            const deskripsi = 'Anda Mendapatkan Perkara Baru Nomor '
            await hitToPenetapan(item.id, item.perkara_id, 'panitera', 'perkara_panitera_pn', 'panitera_id', tentang, deskripsi)
        }
        if(item.tentang === 'PJS'){
            const tentang = 'Pemberitahuan Perkara Baru'
            const deskripsi = 'Anda Mendapatkan Perkara Baru Nomor '
            await hitToPenetapan(item.id, item.perkara_id, 'jurusita', 'perkara_jurusita', 'jurusita_id', tentang, deskripsi)
        }
        if(item.tentang === 'PHS'){
            await hitPhs(item.id, item.perkara_id)
        }
        if(item.tentang === 'TUNDAAN'){
            await hitTundaan(item.id, item.perkara_id)
        }
        if(item.tentang === 'MEDIASI'){
            await hitMediasi(item.id, item.perkara_id)
        }
        if(item.tentang === 'PUTUSAN'){
            await hitPutusan(item.id, item.perkara_id)
        }
        if(item.tentang === 'EDOK'){
            await hitEdok(item.id, item.perkara_id)
        }
        if(item.tentang === 'PMH IKRAR'){
            await hitPmhIkrar(item.id, item.perkara_id)
        }
        if(item.tentang === 'PHS IKRAR'){
            await hitPhsIkrar(item.id, item.perkara_id)
        }
        if(item.tentang === 'BHT'){
            await hitBHT(item.id, item.perkara_id)
        }
    }

    await checkTundaanBelum()
    await checkSidangBesok()
    await checkPerkaraBelumPbt()
    await kirimNotification()
}

const inputNotifDariLuar = async (tentang, user_id, deskripsi) => {
    const userData = await userService.getTokenNotif2('panitera', user_id)
    const checkDataNotif = await ModelNisa.PenerimaNotif.count({ where : { user_id : userData.id, tentang } })
    if(checkDataNotif === 0){
        if(userData.token_notif !== ''){
            await ModelNisa.PenerimaNotif.create({
                tanggal : moment().format('YYYY-MM-DD'),
                notif_id : null,
                user_id : userData.id,
                token_notif : userData.token_notif,
                tentang,
                deskripsi,
                screen : '-'
            })
        }
    }
    return true
}

const checkPerkaraBelumPbt = async () => {
    const data = await perkaraService.getPerkaraPutusBelumPbt()
    const toArrayData = JSON.parse(data)

    for(const item of toArrayData){

        let tentang, deskripsi;

        if(item.lamanya >= 7 && item.lamanya < 14){
            tentang = `Peringatan 7 Hari, Perkara Belum PBT Nomor ${item.nomor_perkara}`
            deskripsi = `Perkara belum diisikan tanggal PBTnya nomor perkara ${item.nomor_perkara}`
        }
        if(item.lamanya >= 14){
            tentang = `Peringatan 7 Hari, Perkara Belum PBT Nomor ${item.nomor_perkara}`
            deskripsi = `Perkara belum diisikan tanggal PBTnya nomor perkara ${item.nomor_perkara}`
        }
        await inputNotifDariLuar(tentang, item.panitera_id, deskripsi)

    }
    return true
}

exports.checkPerkaraPBTbelumBHT = async () => {
    const data = await perkaraService.getPerkaraPbtBelumBht()
    const toArrayData = JSON.parse(data)
    toArrayData.map(async item => {
        const tentang = `Peringatan Mengisi Tanggal BHT Nomor ${item.nomor_perkara}`
        const deskripsi = `peringatan untuk mengisi tanggal bht nomor perkara ${item.nomor_perkara}`
        if(item.putusan_verstek === 'T' && item.lamanya_setelah_putus >= 14){
            await inputNotifDariLuar(tentang, 18, deskripsi)
        }else if(item.putusan_verstek === 'Y' && item.lamanya_setelah_pbt >= 14){
            await inputNotifDariLuar(tentang, 18, deskripsi)
        }
    })
}

exports.checkPerkaraPBTbelumBHTPermohonan = async () => {
    const data = await perkaraService.getPerkaraPbtBelumBhtPermohonan()
    const toArrayData = JSON.parse(data)
    toArrayData.map(async item => {
        const tentang = `Peringatan Mengisi Tanggal BHT Nomor ${item.nomor_perkara}`
        const deskripsi = `peringatan untuk mengisi tanggal bht nomor perkara ${item.nomor_perkara}`
        await inputNotifDariLuar(tentang, 28, deskripsi)
    })
}

const checkSidangBesok = async () => {
    await checkSidangBesokHakim()
    await checkSidangBesokPanitera()
    await checkSidangBesokJurusita()
    await checkSidangBesokPihak()
    return true
}

const checkSidangBesokHakim = async () => {
    const besok = moment(new Date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
    const dataSidang = await perkaraService.getJadwalsidang(besok)

    const arrayDataSidang = dataSidang.map(item => {

        const arrayMajelisHakimId = item.perkara.majelis_hakim_id.split(',').map(item => Number(item))
        const arrayPenerimaNotif = [...arrayMajelisHakimId]
        return {
            perkara_id : item.perkara_id,
            nomor_perkara : item.perkara.nomor_perkara,
            penerima_notif : arrayPenerimaNotif
        }
    })

    for(const perkara of arrayDataSidang){
        await inputNotif('hakim', perkara, perkara.penerima_notif, 'Sidang Besok')
    }
    return true
}

const checkSidangBesokPanitera = async () => {
    const besok = moment(new Date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
    const dataSidang = await perkaraService.getJadwalsidang(besok)

    const arrayDataSidang = dataSidang.map(item => {

        const arrayPenerimaNotif = [item.perkara.panitera.panitera_id]        
        return {
            perkara_id : item.perkara_id,
            nomor_perkara : item.perkara.nomor_perkara,
            penerima_notif : arrayPenerimaNotif
        }
    })

    for(const perkara of arrayDataSidang){
        await inputNotif('panitera', perkara, perkara.penerima_notif, 'Sidang Besok')
    }
    return true
}

const checkSidangBesokJurusita = async () => {
    const besok = moment(new Date, 'YYYY-MM-DD').add(2, 'days').format('YYYY-MM-DD')
    const dataSidang = await perkaraService.getJadwalsidang(besok)

    const arrayDataSidang = dataSidang.map(item => {

        const arrayPenerimaNotif = [item.perkara.jurusita.jurusita_id]        
        return {
            perkara_id : item.perkara_id,
            nomor_perkara : item.perkara.nomor_perkara,
            penerima_notif : arrayPenerimaNotif
        }
    })

    for(const perkara of arrayDataSidang){
        await inputNotif('jurusita', perkara, perkara.penerima_notif, 'Sidang Besok')
    }
    return true
}

const checkSidangBesokPihak = async () => {
    const besok = moment(new Date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
    const dataSidang = await perkaraService.getJadwalsidang(besok)

    const arrayDataSidang = dataSidang.map(item => {

        const arrayPenerimaNotif = [item.perkara_id]
        return {
            perkara_id : item.perkara_id,
            nomor_perkara : item.perkara.nomor_perkara,
            penerima_notif : arrayPenerimaNotif
        }
    })

    for(const perkara of arrayDataSidang){
        await inputNotif('pihak', perkara, perkara.penerima_notif, 'Sidang Besok')
    }
    return true
}

const checkTundaanBelum = async () => {
    const data = await perkaraService.statusSidang()
        const dataStatusSidang = JSON.parse(data)

        for(const perkara of dataStatusSidang){
            const arrayPenerimaNotif = [perkara.panitera_pengganti_id]
            await inputNotif('panitera', perkara, arrayPenerimaNotif, 'Status Sidang')
        }
    return true
}


const inputNotif = async (otoritas = null, data, arrayPenerimaNotif, tentang) => {

    const newArrayObject = await Promise.all(
        arrayPenerimaNotif.map(async item => {
            const userData = await userService.getTokenNotif2(otoritas, item)
            return {
                user_id : userData.id,
                perkara_id : data.perkara_id,
                tentang : `${tentang} ${data.perkara_id}`,
                deskripsi : `Sidang besok untuk nomor perkara ${data.nomor_perkara}`,
                token_notif : userData.token_notif
            }
        })
    )
    const filterArrayObject = newArrayObject.filter(item => item.token_notif !== '')

    filterArrayObject.map(async data => {
        const cekDataNotif = await ModelNisa.PenerimaNotif.count({ where : {
            user_id : data.user_id,
            tentang : data.tentang
        } })

        if(cekDataNotif === 0){
            await ModelNisa.PenerimaNotif.create({
                tanggal : moment().format('YYYY-MM-DD'),
                notif_id : null,
                token_notif : data.token_notif,
                user_id : data.user_id,
                tentang : data.tentang,
                deskripsi : data.deskripsi,
                screen : '-'
            }).then(async res => {
                await KirimNotifLangsung(res)
            })
        }
    })
    return true
}


exports.getPenerimaNotifbyId = (user_id) => {
    return new Promise(resolve => {
        ModelNisa.PenerimaNotif.findAll({where : { user_id }, order: [['id', 'DESC']]})
            .then(res => {
                resolve(res)
            })
    }) 
}


exports.changeUnreadNotif = async (user_id) => {
    const ubahUnreadNotif = await ModelNisa.PenerimaNotif.update({ dibaca : 1 }, {where : { user_id, dibaca : 0, status : 1 }})
    return ubahUnreadNotif
}