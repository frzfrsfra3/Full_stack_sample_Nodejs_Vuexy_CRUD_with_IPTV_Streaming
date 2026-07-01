require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcryptjs');

const DB_NAME = process.env.DB_NAME || 'iptv';

// Connect to MySQL without specifying a database (to create it if missing)
const initKnex = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

async function setup() {
  try {
    console.log('Creating database if not exists...');
    await initKnex.raw(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await initKnex.destroy();

    // Now connect to the new database
    const db = knex({
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: DB_NAME,
      },
      migrations: {
        directory: './migrations',
      },
      seeds: {
        directory: './seeds',
      },
    });

    console.log('Running migrations...');
    await db.migrate.latest();

    console.log('Running seeds...');
    await db.seed.run();

    console.log('Setup complete!');
    await db.destroy();
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();