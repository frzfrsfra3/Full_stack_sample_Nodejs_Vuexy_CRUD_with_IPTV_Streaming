exports.up = function (knex) {
  return knex.schema.createTable('tv_profiles', (table) => {
    table.increments('id');
    table.string('title');
    table.string('profile_type');
    table.integer('days').unsigned().defaultTo(1);
    table.decimal('price_usd', 10, 2).defaultTo(0);
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tv_profiles');
};