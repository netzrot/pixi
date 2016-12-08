module.exports = function(sequelize, DataTypes) {
  var Caption = sequelize.define("captions", {
    body: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Caption.belongsTo(models.images, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        Caption.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return Caption;
};