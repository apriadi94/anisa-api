'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPanitera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPanitera.belongsTo(models.PaniteraPn, {as : 'paniterapn', foreignKey : 'panitera_id'});
    }
  };
  UserPanitera.init({
    userid:  {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    panitera_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserPanitera',
    tableName : 'user_panitera',
    timestamps : false,
    createdAt : false,
    freezeTableName : true,
  });
  return UserPanitera;
};