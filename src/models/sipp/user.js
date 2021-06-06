'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserPanitera, {as : 'upanitera', foreignKey : 'userid'});
      User.hasOne(models.UserHakim, {as : 'uhakim', foreignKey : 'userid'});
      User.hasOne(models.UserJurusita, {as : 'ujurusita', foreignKey : 'userid'});
    }
  };
  User.init({
    userid:  {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    fullname: DataTypes.STRING,
    username: DataTypes.STRING,
    email : DataTypes.STRING,
    username : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName : 'sys_users',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return User;
};