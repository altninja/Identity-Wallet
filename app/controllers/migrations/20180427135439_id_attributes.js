
exports.up = function (knex, Promise) {
    return knex.schema.createTable('id_attributes', (table) => {
        table.increments('id');
        table.integer('walletId').notNullable().references('wallets.id');
        table.integer('idAttributeType').notNullable().references('id_attribute_types.key');
        table.text('items').notNullable().defaultTo("{}");
        table.integer('order').defaultTo(0);
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
        table.unique(['walletId', 'idAttributeType']);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('id_attributes');
};
