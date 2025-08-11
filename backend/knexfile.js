// backend/knexfile.js
require('dotenv').config(); // To use environment variables

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './barberia.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    },
    useNullAsDefault: true // Recommended for SQLite
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL, // Example: postgres://user:pass@host:port/dbname
      ssl: { rejectUnauthorized: false } // Necessary for many cloud providers like Heroku, Render
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  }
};
