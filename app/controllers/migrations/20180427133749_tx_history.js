
exports.up = function(knex, Promise) {
    return knex.schema.createTable('tx_history', (table) => {
        table.string('hash').unique().notNullable();
        table.integer('blockNumber');
        table.integer('timeStamp').notNullable();
        table.integer('nonce').notNullable();
        table.string('blockHash');
        table.string('contractAddress').notNullable();
        table.string('from').notNullable();
        table.string('to').notNullable();
        table.integer('value').notNullable();
        table.string('tokenName').notNullable();
        table.string('tokenSymbol').notNullable();
        table.integer('tokenDecimal').notNullable();
        table.integer('transactionIndex').notNullable();
        table.integer('gas').notNullable();
        table.integer('gasPrice').notNullable();
        table.integer('cumulativeGasUsed');
        table.string('input');
        table.integer('confirmations');
        table.integer('isError');
        table.integer('txReceiptStatus');
        table.integer('networkId').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('tx_history')
};
