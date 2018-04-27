// Update with your config settings.

const electron = require('electron');
const path = require('path');
const dbFilePath = path.join(electron.app.getPath('userData'), 'IdentityWalletStorage.sqlite');

module.exports = {
    development: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbFilePath
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        }
    },
    production: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbFilePath
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        }
    }
};
