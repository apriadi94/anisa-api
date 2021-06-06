'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notif extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notif.hasMany(models.PenerimaNotif, { as : 'penerima', foreignKey : 'notif_id' })
    }
  };
  Notif.init({
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
    perkara_id: DataTypes.INTEGER,
    tentang: DataTypes.STRING,
    status: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'Notif',
    tableName : 'notif',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return Notif;
};