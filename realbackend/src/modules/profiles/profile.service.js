const db = require('../../config/db')

// exports.getAll = async ({ page = 1, per_page = 10, q }) => {
//   const offset = (page - 1) * per_page
//   let query = db('tv_profiles').orderBy('id')
//   if (q) query = query.where('title', 'like', `%${q}%`)
//   const total = await query.clone().count('* as count').first()
//   const data = await query.limit(per_page).offset(offset)
//   return {
//     data,
//     current_page: page,
//     per_page,
//     total: total.count,
//     last_page: Math.ceil(total.count / per_page),
//   }
// }
exports.getAll = async (params = {}) => {
  const { page = 1, per_page = 10, q } = params;
  const offset = (page - 1) * per_page;
  let query = db('tv_profiles').orderBy('id');
  if (q) query = query.where('title', 'like', `%${q}%`);
  const total = await query.clone().count('* as count').first();
  const data = await query.limit(per_page).offset(offset);
  return {
    data,
    current_page: page,
    per_page,
    total: total.count,
    last_page: Math.ceil(total.count / per_page),
  };
};

exports.create = async (data) => {
  const [id] = await db('tv_profiles').insert(data)
  return { id, ...data }
}

exports.getById = async (id) => {
  return db('tv_profiles').where('id', id).first()
}

exports.update = async (id, data) => {
  await db('tv_profiles').where('id', id).update(data)
  return { id, ...data }
}

exports.delete = async (id) => {
  return db('tv_profiles').where('id', id).del()
}