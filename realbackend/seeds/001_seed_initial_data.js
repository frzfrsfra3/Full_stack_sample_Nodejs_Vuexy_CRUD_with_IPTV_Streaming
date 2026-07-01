const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Truncate tables
  await knex('streams').del();
  await knex('tv').del();
  await knex('tv_profiles').del();
  await knex('users').del();

  // Insert admin user
  const hashedPassword = await bcrypt.hash('password', 10); // change to your desired password
  const [adminId] = await knex('users').insert({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
  });

  // Insert TV profiles
  await knex('tv_profiles').insert([
    { title: 'Basic Package', profile_type: 'basic', days: 30, price_usd: 25.00 },
    { title: 'Standard Package', profile_type: 'standard', days: 30, price_usd: 45.00 },
    { title: 'Premium Package', profile_type: 'premium', days: 30, price_usd: 65.00 },
    { title: 'Ultra Package', profile_type: 'ultra', days: 30, price_usd: 90.00 },
  ]);
};