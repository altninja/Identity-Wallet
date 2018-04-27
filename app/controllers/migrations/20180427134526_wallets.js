
exports.up = function (knex, Promise) {
    return knex.schema.createTable('wallets', (table) => {
        table.increments('id');
        table.string('name');
        table.string('publicKey').unique().notNullable();
        table.string('keystoreFilePath');
        table.binary('profilePicture');
        table.integer('isSetupFinished').notNullable().defaultTo(0);
        table.integer('sowDesktopNotifications').notNullable().defaultTo(0);
        table.string('airDropCode');
        table.integer('lastRetrievedEthTxRecord').notNullable().defaultTo(0);
        table.integer('lastRetrievedTokenTxRecord').notNullable().defaultTo(0);
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('wallets');
};
