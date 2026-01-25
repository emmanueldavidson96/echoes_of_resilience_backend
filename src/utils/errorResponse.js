export const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
