'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PelaksanaanRelaas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PelaksanaanRelaas.belongsTo(models.Pihak, {as : 'pihak', foreignKey : 'pihak_id'});
    }
  };
  PelaksanaanRelaas.init({
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    sidang_id : {
      type: DataTypes.INTEGER,
    },
    tanggal_relaas: DataTypes.DATEONLY,
    ket_hasil_relaas: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PelaksanaanRelaas',
    tableName : 'perkara_pelaksanaan_relaas',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return PelaksanaanRelaas;
};