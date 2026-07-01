const streamService = require('./stream.service');

exports.index = async (req, res) => {
  try {
    const result = await streamService.getAll(req.query);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.store = async (req, res) => {
  try {
    const data = req.body;
    data.created_by = req.user.id;
    const stream = await streamService.create(data);
    res.status(201).json({ message: 'Stream created', data: stream });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.show = async (req, res) => {
  const stream = await streamService.getById(req.params.id);
  if (!stream) return res.status(404).json({ message: 'Not found' });
  res.json(stream);
};

exports.update = async (req, res) => {
  try {
    const stream = await streamService.update(req.params.id, req.body);
    res.json({ message: 'Updated', data: stream });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await streamService.delete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.start = async (req, res) => {
  try {
    const result = await streamService.start(req.params.id);
    res.json({ message: 'Stream will start', ...result });
  } catch (e) { res.status(409).json({ message: e.message }); }
};

exports.stop = async (req, res) => {
  try {
    await streamService.stop(req.params.id);
    res.json({ message: 'Stream stopped' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};