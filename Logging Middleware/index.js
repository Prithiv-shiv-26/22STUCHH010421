const logger = require('./logger');

const loggingMiddleware = (stack, level, token) => {
  return (req, res, next) => {
    const message = `${req.method} ${req.originalUrl}`;
    logger(stack, level, 'middleware', message, token);
    next();
  };
};

module.exports = loggingMiddleware;
