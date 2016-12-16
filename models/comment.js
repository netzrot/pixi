module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("comments", {
    body: {
      type: DataTypes.STRING
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Comment.belongsTo(models.images, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        Comment.belongsTo(models.users, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return Comment;
};