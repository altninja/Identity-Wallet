const Promise = require('bluebird');

module.exports = function (app, sqlLiteService) {
    const TABLE_NAME = 'tx_history';
    const Controller = function () { };

    let knex = sqlLiteService.knex;

    /**
     *
     */
    Controller.init = _init;
    Controller.findAll = _findAll;
    Controller.findByWalletId = _findByWalletId;
    Controller.findByWalletIdAndTokenId = _findByWalletIdAndTokenId;


    /**
     *
     */
    function _init() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable(TABLE_NAME).then((exists) => {
                if (!exists) {
                    knex.schema.createTable(TABLE_NAME, (table) => {
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
                    }).then((resp) => {
                        resolve("Table: " + TABLE_NAME + " created.");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function _findAll() {
        return new Promise((resolve, reject) => {
            knex(TABLE_NAME).then((rows) => {
                resolve(rows);
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    function _findByWalletId(walletId) {
        return new Promise((resolve, reject) => {
            knex(TABLE_NAME).where({ walletId: walletId }).then((rows) => {
                resolve(rows);
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    function _findByWalletIdAndTokenId(walletId, tokenId) {
        return new Promise((resolve, reject) => {
            knex(TABLE_NAME).where({ walletId: walletId, tokenId: tokenId }).then((rows) => {
                resolve(rows);
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    return Controller;
}
