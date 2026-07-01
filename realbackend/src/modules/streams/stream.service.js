const db = require('../../config/db');
const ffmpegManager = require('../../services/ffmpegManager');
const { getIO } = require('../../events/socket');

const broadcastStatus = (stream) => {
  const io = getIO();
  if (io) io.emit('stream.status.changed', { stream });
};

exports.getAll = async ({ page = 1, per_page = 10 }) => {
  const offset = (page - 1) * per_page;
  const total = await db('streams').count('* as count').first();
  const data = await db('streams')
    .leftJoin('tv_profiles', 'streams.profile_id', 'tv_profiles.id')
    .select('streams.*', 'tv_profiles.title as profile_title')
    .limit(per_page).offset(offset).orderBy('streams.id', 'desc');
  return {
    data: data.map(s => ({ ...s, profile: s.profile_id ? { id: s.profile_id, title: s.profile_title } : null })),
    current_page: page,
    per_page,
    total: total.count,
    last_page: Math.ceil(total.count / per_page),
  };
};

exports.create = async (data) => {
  const [id] = await db('streams').insert({
    title: data.title,
    slug: data.slug,
    source_url: data.source_url,
    source_type: data.source_type,
    profile_id: data.profile_id || null,
    created_by: data.created_by,
    status: 'inactive',
  });
  return { id, ...data, status: 'inactive' };
};

exports.start = async (id) => {
  const stream = await db('streams').where('id', id).first();
  if (!stream) throw new Error('Stream not found');
  if (['active', 'starting'].includes(stream.status)) throw new Error('Already running');
  await db('streams').where('id', id).update({ status: 'starting' });
  broadcastStatus({ id, status: 'starting' });
  // Start FFmpeg asynchronously
  ffmpegManager.startStream(stream).then(pid => {
    return db('streams').where('id', id).update({ pid, status: 'active' });
  }).then(() => {
    broadcastStatus({ id, status: 'active' });
  }).catch(err => {
    db('streams').where('id', id).update({ status: 'inactive', pid: null });
    broadcastStatus({ id, status: 'inactive' });
  });
  return { stream_id: id, status: 'starting' };
};

exports.stop = async (id) => {
  const stream = await db('streams').where('id', id).first();
  if (!stream) throw new Error('Stream not found');
  ffmpegManager.stopStream(stream);
  await db('streams').where('id', id).update({ pid: null, status: 'inactive' });
  broadcastStatus({ id, status: 'inactive' });
};