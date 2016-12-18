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
      unique: true,
      validate: {
        isEmail: true,
        isUnique: sequelize.validateIsUnique('email', 'That email is being used. Please choose a different email address.')
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUnique: sequelize.validateIsUnique('username', 'That username is taken. Please choose a different username.')
      }
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
            model: models.user_tags,
            unique: false
          }
        });
      }
    }
  });

  return User;
};