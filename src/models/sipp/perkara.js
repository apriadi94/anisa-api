'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Perkara extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Perkara.belongsTo(models.Panitera, {as : 'panitera', foreignKey : 'perkara_id'});
      Perkara.belongsTo(models.Jurusita, {as : 'jurusita', foreignKey : 'perkara_id'});
    }
  };
  Perkara.init({
    perkara_id : {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nomor_perkara: DataTypes.STRING,
    jenis_perkara_nama : DataTypes.STRING,
    alur_perkara_nama : DataTypes.STRING,
    majelis_hakim_kode : DataTypes.STRING,
    majelis_hakim_id : DataTypes.STRING,
    pihak1_text: DataTypes.STRING,
    pihak2_text: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Perkara',
    tableName : 'v_perkara',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  Perkara.removeAttribute('id');
  return Perkara;
};