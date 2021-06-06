const ModelSipp = require('../models/sipp')
const ModelNissa = require('../models/nisa')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const accessTokenSecret = process.env.SECRET_KEY;


exports.userValidate = ({username, password}) => {
    return new Promise(async (resolve, reject) => {
        const checkUser = await ModelNissa.User.findOne({ where : { username, password : md5(password) }})
        if(checkUser){
            const accessToken = jwt.sign({ username: checkUser.username,  otoritas: checkUser.otoritas, id : checkUser.id, userId : checkUser.user_id }, accessTokenSecret);
            const data = {
                id : checkUser.id,
                userId : checkUser.user_id,
                sipp_userid : checkUser.sipp_userid,
                name : checkUser.name,
                otoritas : checkUser.otoritas,
                table_reference : checkUser.table_reference,
                accessToken : accessToken
            }
            resolve(data)
        }else{
            const data = {
                status : 'error',
                message : 'username atau password salah'
            }
            reject(data)
        }
    })
}

exports.getUserPihakByNik = ({username, password}) => {
    const dataError = {
        status : 'error',
        message : 'username atau password salah'
    }
    return new Promise(async (resolve, reject) => {
        if(username !== ''){
            ModelSipp.sequelize.query(`
                SELECT a.id, a.nomor_indentitas, b.perkara_id, b.nomor_perkara FROM v_pihak a
                LEFT JOIN v_pihak_perkara b ON a.id = b.pihak_id
                WHERE a.nomor_indentitas = '${username}' AND b.nomor_perkara like '%${password}%'
            `).then(res => {
                resolve(JSON.stringify(res[0], null, 2))
            })
        }else{
            reject(dataError)
        }
    })
}

exports.getUser = (id) => {
    return new Promise((resolve, reject) => {
        ModelNissa.User.findOne({where : { id }}).then((res) => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

exports.updateToken = (id, token_notif) => {
    return new Promise(resolve => {
        ModelNissa.User.update({ token_notif }, {where : { id }}).then(() => {
            resolve('sukses')
        }).reject(err => {
            reject(err)
        })
    })
}

exports.create = (body) => {
    return new Promise((resolve, reject) => {
        const { name, username, password, otoritas, table_reference, user_id, sipp_userid, token_notif } = body
        ModelNissa.User.create({name, username, otoritas, table_reference, user_id, sipp_userid, token_notif, password : md5(password)})
            .then(() => {
               resolve('sukses')
            })
            .catch(err => {
               reject(err)
            })
    })
}

exports.getUserSippById = async (userid) => {
    return new Promise(async (resove, reject) => {
        const User = await ModelSipp.sequelize.query(`
            select a.userid, a.fullname, a.username, a.email, c.name from sys_users a 
            left join sys_user_group b on a.userid = b.userid
            left join sys_groups c on b.groupid = c.groupid
            where a.userid = ${userid}
        `)
        resove( JSON.stringify(User[0], null, 2))
    })
}

exports.getAllUserSipp = async () => {
    return new Promise(async (resove, reject) => {
        const User = await ModelSipp.User.findAll({
            include: [
                {
                    association : 'uhakim',
                    include: ['hakimpn']
                },
                {
                    association : 'upanitera',
                    include: ['paniterapn']
                },
                {
                    association : 'ujurusita',
                    include: ['jurusitapn']
                }
            ]
        })
        resove(User)
    })
}

exports.getTokenNotif = (user_id) => {
    return new Promise(resolve => {
        ModelNissa.User.findOne({where : { user_id }}).then(res => resolve(res))
    })
}

exports.getTokenNotif2 = (otoritas, user_id) => {
    return new Promise(resolve => {
        ModelNissa.User.findOne({where : { otoritas, user_id }}).then(res => resolve(res))
    })
}