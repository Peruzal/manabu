const initModels = require('../models');

async function updateProfileUrl(userId, url) {
  const models = await initModels();
  const User = models.getModel('user');

  await User.update({ id: userId }).set({ image: url });
}
async function findAllUsers(userId) {
  const models = await initModels();
  const User = models.getModel('User');

  await User.findAll();
}
module.exports = {
  updateProfileUrl,
  findAllUsers
};
