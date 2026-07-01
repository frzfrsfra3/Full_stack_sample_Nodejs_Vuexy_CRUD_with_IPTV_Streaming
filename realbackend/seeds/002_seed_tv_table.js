const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker'); // need to install @faker-js/faker

exports.seed = async function (knex) {
  // Deletes ALL existing entries in tv table to avoid duplicates
  await knex('tv').del();

  const profiles = await knex('tv_profiles').select('id', 'days');
  if (!profiles.length) {
    console.log('No TV profiles found. Please seed profiles first.');
    return;
  }

  // Optional: pick a user as activator (first admin)
  const admin = await knex('users').first();
  const activatorId = admin ? admin.id : null;

  const records = [];
  for (let i = 0; i < 1000; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const phone = faker.phone.number('+963 9## ####');  // Syrian-like numbers
    const username = `${phone.slice(-4)}${Math.floor(Date.now() / 1000).toString().slice(5)}samtv`;
    const password = 'tvpass123';                       // same default password
    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + profile.days);

    records.push({
      first_name: first,
      last_name: last,
      username: username,
      password: hashedPassword,
      phone_number: phone,
      profile_id: profile.id,
      expired_date: expiredDate.toISOString().split('T')[0],
      mac_address: null,
      device_number: `DEV${String(i + 1).padStart(6, '0')}`,
      status: 1,
      activate_status: 'active',
      activated_date: new Date().toISOString().split('T')[0],
      activated_by_id: activatorId,
    });
  }

  // Insert in batches to avoid memory issues (knex handles large inserts)
  await knex.batchInsert('tv', records, 100);
  console.log('Inserted 1000 random TV customers.');
};