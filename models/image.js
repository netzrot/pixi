module.exports = function(sequelize, DataTypes) {
  var Image = sequelize.define("images", {
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Image.hasOne(models.captions);
        Image.hasMany(models.comments);
        Image.belongsToMany(models.users, {
          through: {
            model: models.user_tags,
            unique: false
          }
        });
      }
    }
  });

  return Image;
};