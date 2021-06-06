'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    otoritas: DataTypes.STRING,
    table_reference: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    sipp_userid: DataTypes.INTEGER,
    token_notif: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    tableName : 'users',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return User;
};