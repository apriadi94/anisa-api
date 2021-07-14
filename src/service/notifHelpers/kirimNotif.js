const { Op } = require('sequelize')
const ModelNisa = require('../../models/nisa')
const https = require('https')


exports.kirimNotification = async () => {
    const idNotif = []
    await ModelNisa.PenerimaNotif.findAll({ where : { status : 0 } })
        .then(async res => {
            for(const item of res){
                idNotif.push(item.notif_id)
                await kirimKePenerima(item)
            }
        })
    const uniqueIdNotif = idNotif
        .filter((value, index) => idNotif.indexOf(value) === index)
        .map(item => {return { id : item }})

    await ModelNisa.Notif.update({status : 1}, {
        where : {
            [Op.or] : uniqueIdNotif
        }
    })
    
}

exports.KirimNotifLangsung = async (dataPenerima) => {
    await kirimKePenerima(dataPenerima)
    return true
}


const kirimKePenerima = async (dataPenerima) => {
    //kirim notif oneSignal


    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_AUTH}`
    };

    var data = {
        app_id: process.env.ONESIGNAL_APP_ID,
        headings : {"en" : dataPenerima.tentang},
        contents: {"en": dataPenerima.deskripsi},
        channel_for_external_user_ids: "push",
        include_player_ids: [dataPenerima.token_notif]
    };

    const options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };


    const req = https.request(options, function(res) {
        res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
        });
    });

    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();



    await ModelNisa.PenerimaNotif.update({ status : 1 }, { where : { id : dataPenerima.id } })
}