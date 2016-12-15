module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("users", {
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.images, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        User.hasMany(models.captions);
        User.hasMany(models.comments);
        User.belongsToMany(models.images, {
          through: {
            model: 'UserTags',
            unique: false
          }
        });
      }
    }
  });

  return User;
};