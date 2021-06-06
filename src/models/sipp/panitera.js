'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Panitera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Panitera.init({
    perkara_id : {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    panitera_nama: DataTypes.STRING,
    panitera_id : DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Panitera',
    tableName : 'perkara_panitera_pn',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return Panitera;
};