exports.up = function (knex) {
  return knex.schema.createTable('tv', (table) => {
    table.increments('id');
    table.string('first_name');
    table.string('last_name');
    table.string('username').unique();
    table.string('password');
    table.string('phone_number');
    table.integer('profile_id').unsigned().references('id').inTable('tv_profiles');
    table.date('expired_date');
    table.string('mac_address').nullable();
    table.string('device_number').nullable();
    table.boolean('status').defaultTo(true);
    table.string('activate_status').defaultTo('pending');
    table.date('activated_date').nullable();
    table.text('last_activation_data').nullable();
    table.string('stream_token', 64).unique().nullable();
    table.integer('activated_by_id').unsigned().nullable().references('id').inTable('users');
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tv');
};