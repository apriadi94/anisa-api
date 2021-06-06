'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaniteraPn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PaniteraPn.init({
    id:  {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    kode: DataTypes.STRING,
    nip: DataTypes.STRING,
    nama_gelar: DataTypes.STRING,
    aktif : DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PaniteraPn',
    tableName : 'panitera_pn',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return PaniteraPn;
};