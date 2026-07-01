const profileService = require('./profile.service')

exports.index = async (req, res) => {
  try {
    const result = await profileService.getAll(req.body)
    res.json(result)
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.create = async (req, res) => {
  try {
    const result = await profileService.create(req.body)
    res.status(201).json({ message: 'Created', data: result })
  } catch (e) { res.status(400).json({ message: e.message }) }
}

exports.getById = async (req, res) => {
  try {
    const profile = await profileService.getById(req.params.id)
    if (!profile) return res.status(404).json({ message: 'Not found' })
    res.json(profile)
  } catch (e) { res.status(500).json({ message: e.message }) }
}

exports.update = async (req, res) => {
  try {
    const result = await profileService.update(req.body.id, req.body)
    res.json({ message: 'Updated', data: result })
  } catch (e) { res.status(400).json({ message: e.message }) }
}

exports.delete = async (req, res) => {
  try {
    await profileService.delete(req.body.id)
    res.json({ message: 'Deleted' })
  } catch (e) { res.status(400).json({ message: e.message }) }
}