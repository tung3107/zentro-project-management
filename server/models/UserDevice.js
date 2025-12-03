const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

class UserDevice extends Model {}

UserDevice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    device_name: {
      type: DataTypes.STRING(255),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    last_active: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    token_hash: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: "UserDevice",
    tableName: "user_devices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Define associations
User.hasMany(UserDevice, { foreignKey: "user_id" });
UserDevice.belongsTo(User, { foreignKey: "user_id" });

module.exports = UserDevice;
