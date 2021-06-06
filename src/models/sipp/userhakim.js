'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserHakim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserHakim.belongsTo(models.HakimPn, {as : 'hakimpn', foreignKey : 'hakim_id'});
    }
  };
  UserHakim.init({
    userid:  {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    hakim_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserHakim',
    tableName : 'user_hakim',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return UserHakim;
};