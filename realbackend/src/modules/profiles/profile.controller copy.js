// profile.controller.js
const profileService = require('./profile.service');

exports.index = async (req, res) => {
  const result = await profileService.getAll(req.body);
  res.json(result);
};
exports.create = async (req, res) => {
  const result = await profileService.create(req.body);
  res.status(201).json({ message: 'Created', data: result });
};
// ... getById, update, delete