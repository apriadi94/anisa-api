'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserJurusita extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserJurusita.belongsTo(models.JurusitaPn, {as : 'jurusitapn', foreignKey : 'jurusita_id'});
    }
  };
  UserJurusita.init({
    userid:  {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    jurusita_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserJurusita',
    tableName : 'user_jurusita',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return UserJurusita;
};