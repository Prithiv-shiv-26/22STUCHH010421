const logger = require('./logger');

const loggingMiddleware = (stack, level, packageName) => {
  return (req, res, next) => {
    const message = `${req.method} ${req.originalUrl}`;
    logger({ stack, level, message, packageName });
    next();
  };
};

module.exports = loggingMiddleware;
