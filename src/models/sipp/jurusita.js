'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jurusita extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Jurusita.init({
    perkara_id : {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    jurusita_nama: DataTypes.STRING,
    jurusita_id: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'Jurusita',
    tableName : 'perkara_jurusita',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return Jurusita;
};