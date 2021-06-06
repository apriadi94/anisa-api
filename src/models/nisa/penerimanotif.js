'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PenerimaNotif extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PenerimaNotif.belongsTo(models.Notif, { alias : 'notif', foreignKey : 'notif_id' })
    }
  };
  PenerimaNotif.init({
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    tanggal: DataTypes.DATEONLY,
    notif_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    token_notif: DataTypes.STRING,
    tentang: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    screen: DataTypes.STRING,
    dibaca: DataTypes.INTEGER,
    status: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'PenerimaNotif',
    tableName : 'penerima_notif',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return PenerimaNotif;
};