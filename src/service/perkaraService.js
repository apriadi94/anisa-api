const ModelSipp = require('../models/sipp')
const moment = require('moment')
const {Op} = require('sequelize')

exports.getDataPerkara = (like) => {
    return models.Perkara.count({where : { 
        tanggal_pendaftaran : {
            [Op.like] : '%2021%'
        },
        nomor_perkara : {
            [Op.like] : like
        }
    }})
}

exports.dataVPerkaraById = (perkaraId) => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
            select perkara_id, nomor_perkara, jenis_perkara_nama, proses_terakhir_text from v_perkara where perkara_id = ${perkaraId}
        `).then(result => {
            resolve(JSON.stringify(result[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.dataProsesPerkara = (perkaraId) => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
            select * from perkara_proses where perkara_id = ${perkaraId}
        `).then(result => {
            resolve(JSON.stringify(result[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.dataBiayaPerkara = (perkaraId) => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
            SELECT jenis_transaksi, tanggal_transaksi as tanggal, uraian, jumlah FROM perkara_biaya WHERE perkara_id = ${perkaraId}
        `).then(result => {
            resolve(JSON.stringify(result[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.getDataPerkaraById = (tableName, fieldName, idUser) => {
    const tahunIni = moment().format('YYYY')
    return new Promise((resolve, reject) => {
            ModelSipp.sequelize.query(`
            select 
            (select count(perkara_id) from v_perkara where tanggal_pendaftaran like '%${tahunIni}%') as jumlah_perkara,
            (select count(perkara_id) from v_perkara where tanggal_putusan like '%${tahunIni}%') as jumlah_putus,
            (select count(perkara_id) from v_perkara where tanggal_putusan is null and tanggal_pendaftaran like '%${tahunIni}%') as jumlah_berjalan,
            (SELECT COUNT(a.perkara_id)
                            FROM perkara_${tableName} a
                            LEFT JOIN v_perkara b ON a.perkara_id = b.perkara_id
                            WHERE a.${fieldName}_id = ${idUser} AND a.aktif = 'Y' AND b.tanggal_putusan IS NULL) as perkara_saya_sedang_berlangsung,
            (SELECT COUNT(a.perkara_id)
                            FROM perkara_${tableName} a
                            LEFT JOIN v_perkara b ON a.perkara_id = b.perkara_id
                            WHERE a.${fieldName}_id = ${idUser} AND a.aktif = 'Y' AND tanggal_pendaftaran LIKE '%${tahunIni}%') AS perkara_saya_tahun_ini
            `).then(result => {
                resolve(JSON.stringify(result[0], null, 2))
            }).catch(err => {
                reject(err)
            })
    })
}

exports.getDataPerkaraTiapBulan = () => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
            SELECT 
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 1 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS januari,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 2 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS februari,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 3 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS maret,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 4 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS april,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 5 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS mei,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 6 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS juni,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 7 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS juli,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 8 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS agustus,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 9 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS oktober,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 10 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS september,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 11 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS november,
            ROUND(SUM(CASE WHEN MONTH(tanggal_pendaftaran) = 12 THEN MONTH(tanggal_pendaftaran)/MONTH(tanggal_pendaftaran) ELSE 0 END)) AS desember
            FROM perkara where tanggal_pendaftaran like '%${moment().format('YYYY')}%';
        `).then(result => {
            resolve(JSON.stringify(result[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.statusSidang = () => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
                SELECT t.perkara_id, t.nomor_perkara, t.proses_terakhir_text, t.majelis_hakim_id, z.id as panitera_pengganti_id,
                l1.tanggal_sidang, perkara_penetapan.panitera_pengganti_text,z.kode
                FROM v_perkara t
                LEFT JOIN perkara_penetapan  ON t.perkara_id = perkara_penetapan.perkara_id
                LEFT JOIN panitera_pn z ON perkara_penetapan.panitera_pengganti_id = z.id  
                LEFT JOIN perkara_jadwal_sidang l1  ON t.perkara_id = l1.perkara_id
                LEFT JOIN perkara_jadwal_sidang l2 ON l1.perkara_id=l2.perkara_id AND
                l1.id < l2.id
                WHERE t.proses_terakhir_id < '205'
                AND l1.tanggal_sidang < '${moment().format('YYYY-MM-DD')}'
                AND l2.id IS NULL
                ORDER BY t.perkara_id DESC;
        `).then(res => {
            resolve(JSON.stringify(res[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.getJadwalsidang = (tanggal_sidang) => {
    return new Promise(resolve => {
        ModelSipp.JadwalSidang.findAll({
            include : [
                {
                    association : 'perkara',
                    include : ['panitera', 'jurusita'],
                    order : ['id','desc']
                },
                {
                    association : 'relaas',
                    include : ['pihak']
                },
            ],
            where : { tanggal_sidang }
        })
        .then(result => {
            resolve(result)
        })
    })
}

exports.getPerkaraPutusBelumPbt = () => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
        SELECT DATEDIFF("${moment().format('YYYY-MM-DD')}", c.tanggal_putusan) AS lamanya, a.nomor_perkara, d.id AS panitera_id, c.tanggal_putusan
        FROM v_perkara a 
        LEFT JOIN perkara_putusan_pemberitahuan_putusan b ON a.perkara_id = b.perkara_id
        LEFT JOIN perkara_putusan c ON a.perkara_id = c.perkara_id
        LEFT JOIN panitera_pn d ON a.panitera_pengganti_id = d.id
        LEFT JOIN delegasi_keluar e ON e.perkara_id = a.perkara_id
        WHERE c.tanggal_putusan LIKE '%${moment().format('YYYY')}%'
        AND c.status_putusan_id = 62
        AND b.tanggal_pemberitahuan_putusan IS NULL
        AND b.pihak = 2
        AND a.jenis_perkara_id != 360
        AND a.nomor_perkara LIKE '%Pdt.G%'
        AND c.status_putusan_id NOT IN ('67','7','63','65','93','66','64')
        AND e.perkara_id IS NULL
        GROUP BY b.perkara_id
        HAVING lamanya >= 7
        `).then(res => {
            resolve(JSON.stringify(res[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.getPerkaraPbtBelumBht = () => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
        SELECT a.perkara_id, a.nomor_perkara, a.putusan_verstek, a.tanggal_putusan, b.tanggal_pemberitahuan_putusan, c.id AS panitera_id,
        DATEDIFF("${moment().format('YYYY-MM-DD')}", b.tanggal_pemberitahuan_putusan) AS lamanya_setelah_pbt, 
        DATEDIFF("${moment().format('YYYY-MM-DD')}", a.tanggal_putusan) AS lamanya_setelah_putus
        FROM v_perkara a
        LEFT JOIN perkara_putusan_pemberitahuan_putusan b ON a.perkara_id = b.perkara_id
        LEFT JOIN panitera_pn c ON a.panitera_pengganti_id = c.id
        WHERE b.pihak = 2
        AND a.status_putusan_id = 62
        AND a.tanggal_bht IS NULL
        AND a.tanggal_putusan LIKE '%${moment().format('YYYY')}%'
        `).then(res => {
            resolve(JSON.stringify(res[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.getPerkaraPbtBelumBhtPermohonan = () => {
    return new Promise((resolve, reject) => {
        ModelSipp.sequelize.query(`
            SELECT a.perkara_id, a.nomor_perkara, a.tanggal_bht, DATEDIFF("${moment().format('YYYY-MM-DD')}", a.tanggal_putusan) AS lamanya
            FROM v_perkara a
            WHERE a.alur_perkara_nama = 'Perdata Permohonan' 
            AND a.tanggal_putusan IS NOT NULL
            AND a.tanggal_bht IS NULL
            HAVING lamanya >= 15
        `).then(res => {
            resolve(JSON.stringify(res[0], null, 2))
        }).catch(err => {
            reject(err)
        })
    })
}

exports.refactoryDataPihak = item => {
    let pihak = []
    if(item.perkara.alur_perkara_nama === 'Perdata Gugatan'){
       if(item.perkara.jenis_perkara_nama === 'Cerai Gugat' || item.perkara.jenis_perkara_nama === 'Cerai Talak'){
        let P, T;
        if(item.perkara.jenis_perkara_nama === 'Cerai Gugat') {
            P = 'Penggugat'; 
            T = 'Tergugat'
        }else{
            P = 'Pemohon'; 
            T = 'Termohon'
        }
        pihak[0] = `${P}: ${item.perkara.pihak1_text}`; 
        pihak[1] = `${T}: ${item.perkara.pihak2_text}`; 
       }

       if(item.perkara.jenis_perkara_nama === 'Kewarisan' || item.perkara.jenis_perkara_nama === 'Pengesahan Perkawinan/Istbat Nikah'){
        const Pihak1 = item.perkara.pihak1_text.split('<br />').map((pihak, index) => (`Pemohon ${index + 1} : ${pihak.replace(/[0-9]/, '')}`))
        const Pihak2 = item.perkara.pihak2_text.split('<br />').map((pihak, index) => (`Termohon ${index + 1} : ${pihak.replace(/[0-9]/, '')}`))

        pihak = [...Pihak1, Pihak2]
       }
    }else{
        const PihakPemohon = item.perkara.pihak1_text.split('<br />')
        for(let i = 0; i < PihakPemohon.length; i++){
            pihak[i] = `Pemohon ${i + 1} : ${PihakPemohon[i]}`
        }
    }
    return{...item.dataValues, pihak}
}