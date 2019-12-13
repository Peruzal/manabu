const initModels = require('../models');

module.exports = async (req, res, next) => {
  const models = await initModels();
  const User = models.getModel('user');
  const user = await User.find({ email: 'jon@thewall.com' });
  req.user = user[0];
  req.role = 'admin';
  return next();
};
