'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class JadwalSidang extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            JadwalSidang.belongsTo(models.Perkara, {as : 'perkara', foreignKey : 'perkara_id'});
            // JadwalSidang.belongsToMany(models.PelaksanaanRelaas, {as : 'relaas', foreignKey : 'sidang_id'});
            JadwalSidang.hasMany(models.PelaksanaanRelaas, {as : 'relaas', foreignKey : 'sidang_id'})
        }
    };
    JadwalSidang.init({
        perkara_id: {
            type : DataTypes.INTEGER,
            references: { model: 'Perkara', key: 'perkara_id' }
        },
        tanggal_sidang : DataTypes.DATEONLY,
        agenda : DataTypes.STRING,
        urutan : DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'JadwalSidang',
        tableName: 'perkara_jadwal_sidang',
        freezeTableName: true,
        timestamps: false,
        createdAt: false,
    });
    return JadwalSidang;
};
