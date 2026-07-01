exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.string('last_name').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('last_name');
  });
};