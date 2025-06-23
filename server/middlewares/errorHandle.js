const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");
const ApiError = require("../utils/ApiError");
const { JsonWebTokenError } = require("jsonwebtoken");

const handleSequelizeValidation = (error) => {
  const errors = error.error.map((err) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));
  console.log(error, errors);

  return new ApiError(errors.message, 400, true, error.stack);
};

const handleSequelizeUniqueConstraintError = (error) => {
  const field = error.errors[0]?.path || "unknown";
  const message = `${field} is existed in system`;

  return new ApiError(message, 409, true, error.stack);
};

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new ApiError(message, 400);
};

const handleJWTError = () => {
  return new ApiError("Token không hợp lệ. Vui lòng đăng nhập lại!", 401);
};
const handleJWTExpiredError = () => {
  return new ApiError(401, "Token đã hết hạn. Vui lòng đăng nhập lại!");
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: "failed",
    error: {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      details: err.details || null,
    },
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        message: "Có lỗi xảy ra! Vui lòng thử lại sau.",
      },
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err instanceof ValidationError) {
      error = handleSequelizeValidation(err);
      error.details = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
        value: e.value,
      }));
    }

    if (err instanceof UniqueConstraintError) {
      error = handleSequelizeUniqueConstraintError(err);
    }

    if (err instanceof JsonWebTokenError) {
      error = handleJWTError(err);
    }
    if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
      error.code = ERROR_CODES.TOKEN_EXPIRED;
    }
    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
