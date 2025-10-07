// models/User.ts
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Role = require("./Role");

function generateUserId() {
  const year = new Date().getFullYear();
  const array = new Uint32Array(1);
  const time = Date.now().toString().slice(-3);
  crypto.webcrypto.getRandomValues(array); // dùng webcrypto
  const random3 = (array[0] % 1000).toString().padStart(3, "0");
  return `${year}${time}${random3}`;
}

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.STRING(35),
      primaryKey: true,
      autoIncrement: true,
    },
    is_change_password: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.CHAR(50),
      allowNull: true,
      unique: {
        args: true,
        msg: "Email address already in use!",
      },
      validate: {
        isEmail: { msg: "Please enter a valid email" },
        notEmpty: { msg: "Email is required" },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password is required" },
        len: {
          args: [8, 35],
          msg: "Mật khẩu phải dài 8-35 ký tự",
        },
        is: {
          args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/,
          msg: "Mật khẩu phải có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt",
        },
      },
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name is required" },
        len: {
          args: [1, 255],
          msg: "First name must be at least 6 characters long",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name is required" },
        len: {
          args: [1, 255],
          msg: "Last name must be at least 6 characters long",
        },
      },
    },
    avatar: {
      type: DataTypes.CHAR(255),
    },
    phone: {
      type: DataTypes.STRING(255),
      unique: {
        args: true,
        msg: "Phone already in use!",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role_id is required" },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    otpToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    otpTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "User",
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (!user.user_id) {
          user.user_id = generateUserId();
        }

        user.is_change_password = 1;

        if (user.password && !user.password.startsWith("$2b$")) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      },

      // Bỏ afterValidate, chỉ dùng beforeSave
      beforeSave: async (user) => {
        if (
          user.changed("password") &&
          user.password &&
          !user.password.startsWith("$2b$")
        ) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      },
    },
    defaultScope: {
      attributes: {
        exclude: ["password", "refreshToken", "otpToken"],
      },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
      withTokens: {
        attributes: {
          include: ["refreshToken", "otpToken"],
        },
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this.user_id,
      email: this.email,
      role_id: this.role_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

User.prototype.generateRefreshToken = function (isRemember) {
  const refreshToken = jwt.sign(
    { id: this.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: isRemember ? process.env.JWT_REFRESH_EXPIRE : "1d" }
  );
  this.refreshToken = refreshToken;
  return refreshToken;
};

User.prototype.generateOTPToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpToken = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpTokenExpires = Date.now() + 5 * 60 * 1000;

  return otp;
};

module.exports = User;
