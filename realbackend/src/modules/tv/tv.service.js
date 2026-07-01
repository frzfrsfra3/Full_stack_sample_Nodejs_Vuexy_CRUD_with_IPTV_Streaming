const db = require('../../config/db');
const bcrypt = require('bcryptjs');

function computeActivateStatusExp(activateStatus, expiredDate) {
  if (activateStatus === 'new') return 'new';
  if (activateStatus === 'pending') return 'pending';
  if (new Date(expiredDate) < new Date()) return 'expired';
  if (activateStatus === 'cancel') return 'cancel';
  return 'active';
}

const paginate = async (baseQuery, page, per_page) => {
  const offset = (page - 1) * per_page;
  const total = await baseQuery.clone().count('* as count').first();
  const data = await baseQuery.limit(per_page).offset(offset);
  return {
    data,
    current_page: page,
    per_page,
    total: total.count,
    last_page: Math.ceil(total.count / per_page),
  };
};

// Helper to enrich TV rows with activator info and computed status
function enrichTvRows(rows) {
  return rows.map(tv => ({
    ...tv,
    activate_status_exp: computeActivateStatusExp(tv.activate_status, tv.expired_date),
    activated_by: tv.activator_name ? {
      name: tv.activator_name,
      last_name: tv.activator_last_name,
      branch: null
    } : null
  }));
}

exports.getCustomers = async ({ page = 1, page_size, per_page = 10, q } = {}) => {
  per_page = page_size || per_page;
  const offset = (page - 1) * per_page;

  let query = db('tv')
    .leftJoin('users', 'tv.activated_by_id', 'users.id')
    .select(
      'tv.*',
      'users.name as activator_name',
      'users.last_name as activator_last_name'
    )
    .orderBy('tv.id', 'desc');

  if (q) query = query.where('tv.first_name', 'like', `%${q}%`).orWhere('tv.last_name', 'like', `%${q}%`);

  const totalQuery = db('tv')
    .leftJoin('users', 'tv.activated_by_id', 'users.id')
    .select(db.raw('count(*) as count'));

  if (q) totalQuery.where('tv.first_name', 'like', `%${q}%`).orWhere('tv.last_name', 'like', `%${q}%`);

  const total = await totalQuery.first();
  const data = await query.limit(per_page).offset(offset);

  return {
    data: enrichTvRows(data),
    current_page: page,
    per_page,
    total: total.count,
    last_page: Math.ceil(total.count / per_page),
  };
};

exports.getPendingCustomers = async ({ page = 1, page_size, per_page = 10, q } = {}) => {
  per_page = page_size || per_page;
  const offset = (page - 1) * per_page;

  let query = db('tv')
    .leftJoin('users', 'tv.activated_by_id', 'users.id')
    .select(
      'tv.*',
      'users.name as activator_name',
      'users.last_name as activator_last_name'
    )
    .where('tv.activate_status', 'pending')
    .orderBy('tv.id', 'desc');

  if (q) query = query.where('tv.first_name', 'like', `%${q}%`).orWhere('tv.last_name', 'like', `%${q}%`);

  const totalQuery = db('tv')
    .leftJoin('users', 'tv.activated_by_id', 'users.id')
    .where('tv.activate_status', 'pending');

  if (q) totalQuery.where('tv.first_name', 'like', `%${q}%`).orWhere('tv.last_name', 'like', `%${q}%`);

  const total = await totalQuery.count('* as count').first();
  const data = await query.limit(per_page).offset(offset);

  return {
    data: enrichTvRows(data),
    current_page: page,
    per_page,
    total: total.count,
    last_page: Math.ceil(total.count / per_page),
  };
};

// ... keep all the other existing functions below (create, update, etc.) ...
exports.getProfilesForActivation = async (user) => {
  const profiles = await db('tv_profiles').select('id', 'title', 'days', 'price_usd');
  return {
    profiles,
    user_infos: {},
  };
};

exports.createCustomer = async (data, userId) => {
  const profile = await db('tv_profiles').where('id', data.profile_id).first();
  if (!profile) throw new Error('Profile not found');
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + profile.days);
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const insertData = {
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username,
    password: hashedPassword,
    phone_number: data.phone_number,
    profile_id: data.profile_id,
    expired_date: expiredDate.toISOString().split('T')[0],
    mac_address: data.mac_address || null,
    device_number: data.device_number || null,
    status: 1,
    activated_by_id: userId,
    activate_status: 'active',
    activated_date: new Date().toISOString().split('T')[0],
  };
  const [id] = await db('tv').insert(insertData);
  return { id, ...insertData };
};

exports.getCustomerById = async (id) => {
  const tv = await db('tv').where('id', id).first();
  if (!tv) throw new Error('Customer not found');
  return {
    tv,
    profiles: await db('tv_profiles').select('id', 'title'),
    user_infos: {}
  };
};

exports.updateCustomer = async (data, user) => {
  const customer = await db('tv').where('id', data.id).first();
  if (!customer) throw new Error('Not found');
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  else delete data.password;
  await db('tv').where('id', data.id).update(data);
  return { id: data.id, ...data };
};

exports.activateCustomer = async (data, user) => {
  const customer = await db('tv').where('id', data.id).first();
  if (!customer) throw new Error('Not found');
  const profile = await db('tv_profiles').where('id', data.profile_id).first();
  if (!profile) throw new Error('Profile not found');
  const newExpiry = new Date(customer.expired_date);
  newExpiry.setDate(newExpiry.getDate() + profile.days);
  await db('tv').where('id', data.id).update({
    profile_id: data.profile_id,
    activate_status: 'active',
    activated_date: new Date().toISOString().split('T')[0],
    expired_date: newExpiry.toISOString().split('T')[0],
    status: 1,
  });
  return { id: data.id, activate_status: 'active' };
};

exports.deleteCustomer = async (id) => {
  await db('tv').where('id', id).del();
};

exports.activateOrCancel = async ({ id, status }) => {
  const customer = await db('tv').where('id', id).first();
  if (!customer) throw new Error('Not found');
  if (status === 'active') {
    const profile = await db('tv_profiles').where('id', customer.profile_id).first();
    const newExpiry = new Date(customer.expired_date);
    newExpiry.setDate(newExpiry.getDate() + (profile?.days || 0));
    await db('tv').where('id', id).update({
      activate_status: 'active',
      expired_date: newExpiry.toISOString().split('T')[0],
      status: 1,
    });
  } else {
    await db('tv').where('id', id).update({ activate_status: status });
  }
  return { id, activate_status: status };
};