const tvService = require('./tv.service');

exports.index = async (req, res) => {
  try {
    const result = await tvService.getCustomers(req.body);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.pending = async (req, res) => {
  try {
    const result = await tvService.getPendingCustomers(req.body);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getProfiles = async (req, res) => {
  try {
    const profiles = await tvService.getProfilesForActivation(req.user);
    res.json(profiles);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const tv = await tvService.createCustomer(data, req.user.id);
    res.status(201).json({ message: 'Customer created', data: tv });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const data = await tvService.getCustomerById(req.params.id, req.user);
    res.json(data);
  } catch (e) { res.status(404).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const result = await tvService.updateCustomer(req.body, req.user);
    res.json({ message: 'Updated', data: result });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.activate = async (req, res) => {
  try {
    const result = await tvService.activateCustomer(req.body, req.user);
    res.json({ message: 'Activated', data: result });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await tvService.deleteCustomer(req.body.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.activateOrCancel = async (req, res) => {
  try {
    const result = await tvService.activateOrCancel(req.body);
    res.json({ message: 'Status updated', data: result });
  } catch (e) { res.status(400).json({ message: e.message }); }
};