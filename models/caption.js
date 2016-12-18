module.exports = function(sequelize, DataTypes) {
  var Caption = sequelize.define("captions", {
    body: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 150]
      }
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
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