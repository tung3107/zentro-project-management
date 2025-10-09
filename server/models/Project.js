const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const crypto = require("crypto");

function generateProjectID(projectName) {
  const array = new Uint32Array(1);
  const time = Date.now().toString().slice(-3);
  crypto.webcrypto.getRandomValues(array); // dùng webcrypto
  const random3 = (array[0] % 1000).toString().padStart(3, "0");

  return `PRJ-${time}${random3}`;
}

class Project extends Model {}

Project.init(
  {
    project_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    project_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Project name is required" },
        len: {
          args: [1, 255],
          msg: "Project name must be at least 6 characters long",
        },
      },
    },
    description: {
      type: DataTypes.STRING(255),
      validate: {
        len: {
          args: [0, 255],
          msg: "Description must be no more than 255 characters",
        },
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [
            [
              "ĐANG CHUẨN BỊ",
              "TẠM DỪNG",
              "ĐANG DIỄN RA",
              "HOÀN THÀNH",
              "BỊ HỦY",
            ],
          ],
          msg: "Status must be one of: new ,pending, in_progress, completed, cancelled",
        },
      },
      defaultValue: "ĐANG CHUẨN BỊ",
    },
    priority: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.CHAR(255),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "Project",
    tableName: "projects",
    timestamps: false,
    hooks: {
      beforeCreate: async (project) => {
        if (!project.project_id) {
          project.project_id = generateProjectID(project.project_name);
        }
      },
    },
  }
);

module.exports = Project;
