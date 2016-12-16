module.exports = function(sequelize, DataTypes) {
  var UserTag = sequelize.define("user_tags", {});
  return UserTag;
}