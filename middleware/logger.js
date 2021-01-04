const logger = (req, ress, next) => {
  console.log(`${req.method} ${req.protocol}://${req.originalUrl}`);
  next();
};

module.exports = logger;
