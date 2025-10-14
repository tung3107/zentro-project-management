const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class WorkFlow extends Model {}

WorkFlow.init(
  {
    transition_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    from_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "project_status",
        key: "status_id",
      },
    },
    to_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "project_status",
        key: "status_id",
      },
    },
    allowed_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "role_id",
      },
    },
  },
  {
    sequelize,
    modelName: "WorkFlow",
    tableName: "workflow_transition",
    timestamps: false,
  }
);

module.exports = WorkFlow;
