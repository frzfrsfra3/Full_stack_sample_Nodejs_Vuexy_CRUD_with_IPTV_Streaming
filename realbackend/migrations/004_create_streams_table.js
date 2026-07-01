exports.up = function (knex) {
  return knex.schema.createTable('streams', (table) => {
    table.increments('id');
    table.string('title');
    table.string('slug').unique();
    table.integer('profile_id').unsigned().nullable().references('id').inTable('tv_profiles');
    table.text('source_url').nullable();
    table.string('source_type').defaultTo('hls');
    table.string('status').defaultTo('inactive');
    table.integer('created_by').unsigned().nullable().references('id').inTable('users');
    table.integer('pid').nullable();
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('streams');
};