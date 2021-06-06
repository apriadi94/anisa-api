const userService = require('../../service/userService')
const perkaraService = require('../../service/perkaraService')
const e = require('cors')

const Controller = () => {

    const getMyUser = (req, res) => {
        userService.getUser(req.user.id).then(async result => {

            if(req.user.otoritas !== 'pihak'){
                const jumlahTotalPerkara = await perkaraService.getDataPerkaraById(result.table_reference, result.otoritas, req.user.userId);
                res.send({
                    id : result.id,
                    username : result.username,
                    userid : result.user_id,
                    sipp_userid : result.sipp_userid,
                    name : result.name,
                    otoritas : result.otoritas,
                    table : result.table_reference,
                    perkara : JSON.parse(jumlahTotalPerkara)[0]
                })
            }else{
                const getDataPerkara = await perkaraService.dataVPerkaraById(result.user_id)
                const getProsesPerkara = await perkaraService.dataProsesPerkara(result.user_id)
                const dataPerkara = JSON.parse(getDataPerkara)[0]
                const prosesPerkara = JSON.parse(getProsesPerkara)

                res.send({
                    id : result.id,
                    username : result.username,
                    userid : result.user_id,
                    name : result.name,
                    otoritas : result.otoritas,
                    table : result.table_reference,
                    proses_terakhir : dataPerkara.proses_terakhir_text,
                    proses : prosesPerkara
                })
            }
            
        }).catch(err => {
            res.send({
                message: err,
                status: 500
            }).status(500)
        })

    }

    const getUserSippByid = (req, res) => {
        const { id } = req.params
        userService.getUserSippById(id).then(result => {
            res.send(JSON.parse(result)[0])
        }).catch(err => {
            res.status(500).send(err)
        })
    }

    const updateTokenNotif = (req, res) => {
        const { token } = req.body
        const { id } = req.user

        userService.updateToken(id, token).then(result => {
            res.send({
                message : 'sukses',
            })
        }).catch(err => {
            res.send({
                message : err,
                status : 500
            }).status(500)
        })
    }
    
    const signIn = (req, res) => {
        const { username, password } = req.body
        userService.userValidate({ username, password })
            .then(result => {
                res.send(result)
            }).catch(err => {
                res.status(401).send(err)
            })
    }

    const signInWithNik = async (req, res) => {
        const { username, password } = req.body
        userService.userValidate({ username, password })
            .then(result => {
                res.send(result)
            }).catch(async err => {
               userService.getUserPihakByNik({ username, password })
                    .then(async result => {
                        const dataUser = JSON.parse(result)[0]
                        if(dataUser){
                            const splitNomorPerkara = dataUser.nomor_perkara.split('/')
                            const body = {
                                name : dataUser.nomor_perkara, 
                                username : dataUser.nomor_indentitas, 
                                password : splitNomorPerkara[0], 
                                otoritas : 'pihak', 
                                table_reference : 'pihak', 
                                user_id : dataUser.perkara_id, 
                                sipp_userid : dataUser.id, 
                                token_notif : ''
                            }
                            await userService.create(body)
                            userService.userValidate({ username, password })
                            .then(result => {
                                res.send(result)
                            }).catch(err => {
                                res.status(401).send(err)
                            })
                        }else{
                            res.status(401).send(err)
                        }
                    }).catch(err => {
                        res.status(401).send(err)
                    })
               
            })
    }
    
    const signUp = (req, res) => {
        userService.create(req.body)
            .then(() => {
                res.send({
                    status : 'sukses',
                    message : 'User Berhasil Diuat'
                })
            })
            .catch(err => {
                res.status(500).send({
                    status : 'error',
                    message : err
                })
            })
    }
    
    const getSippUsers = async (req, res) => {
        const {jabatan = 'panitera'} = req.query
        const dataUser = await userService.getAllUserSipp()
        const newDataUser = []
        const ReduceParameter = (namepn, jabatan, table) => {
            return {
                jabatan : jabatan,
                detil : {
                        table : table,
                        id : namepn.id,
                        nama : namepn.nama_gelar,
                        nip : namepn.nip,
                    },
                aktif : namepn.aktif
            }
        }
        dataUser.forEach(user => {
            let newData;
                if(user.uhakim !== null){
                    newData = ReduceParameter(user.uhakim.hakimpn, 'hakim', 'hakim_pn')
                }
                else if(user.upanitera !== null){
                    newData = ReduceParameter(user.upanitera.paniterapn, 'panitera', 'panitera_pn')
                }
                else if(user.ujurusita !== null){
                    newData = ReduceParameter(user.ujurusita.jurusitapn, 'jurusita', 'jurusita')
                }else{
                    newData = { jabatan : '-' }
                }
    
            newDataUser.push({
                userid : user.userid,
                newData
            })
        })
    
        const sendData = newDataUser.filter(item => item.newData.jabatan === jabatan && item.newData.aktif === 'Y')
    
        sendData.forEach(user => {
            const body = {name : user.newData.detil.nama, username : user.newData.detil.nip, password : '123456', otoritas : user.newData.jabatan, table_reference : user.newData.detil.table, user_id : user.newData.detil.id, sipp_userid : user.userid, token_notif : ''}
            userService.create(body)
        })
        res.json(sendData)
    }


    return { getMyUser, getUserSippByid,  signIn, signUp, getSippUsers, updateTokenNotif, signInWithNik }
}

module.exports = Controller