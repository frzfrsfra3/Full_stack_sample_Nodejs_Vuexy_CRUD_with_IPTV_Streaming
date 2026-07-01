const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');
const ffmpegConfig = require('../../config/ffmpeg');

exports.auth = async (req, res) => {
  const token = req.headers['x-token'] || req.query.token;
  if (!token) return res.status(401).send('Unauthorized');
  const [tv] = await db('tv').where('stream_token', token).where('status', 1).whereRaw('expired_date > NOW()');
  if (!tv) return res.status(403).send('Forbidden');
  // You could also check stream slug if provided...
  res.status(200).send('OK');
};

exports.check = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).send('Authorization Required');
  const base64 = authHeader.slice(6);
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  const [tv] = await db('tv').where('username', username);
  if (!tv || !(await bcrypt.compare(password, tv.password))) return res.status(401).send('Invalid credentials');
  if (!tv.status || new Date(tv.expired_date) <= new Date() || tv.activate_status !== 'active')
    return res.status(403).send('Subscription expired / inactive');
  // Optionally check slug and profile
  const slug = req.params.slug || req.headers['x-stream-slug'];
  if (slug) {
    const [stream] = await db('streams').where('slug', slug);
    if (stream && stream.profile_id && tv.profile_id !== stream.profile_id)
      return res.status(403).send('Stream not allowed');
  }
  res.status(200).send('OK');
};

exports.proxy = async (req, res) => {
  // Simplified: just serve the file from HLS directory after auth check (using query credentials for demo)
  const { username, password } = req.query;
  if (!username || !password) return res.status(400).send('Missing credentials');
  const [tv] = await db('tv').where('username', username);
  if (!tv || !(await bcrypt.compare(password, tv.password))) return res.status(401).send('Invalid credentials');
  // Profile/stream checks can be added
  const filePath = path.join(ffmpegConfig.hlsBasePath, req.params.slug, req.params.file);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', req.params.file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T');
  fs.createReadStream(filePath).pipe(res);
};