'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pihak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Pihak.init({
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nama: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Pihak',
    tableName : 'pihak',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return Pihak;
};