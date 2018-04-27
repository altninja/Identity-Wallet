const electron = require('electron');

module.exports = function (knex) {
    const TABLE_NAME = 'action_logs';
    const Controller = function () { };
    let knex = sqlLiteService.knex;

    /**
     *
     */
    Controller.add = _add;
    Controller.findByWalletId = _findByWalletId;

    /**
     *
     */
    async function _add(item) {
        item.createdAt = new Date().getTime();
        return await knex(TABLE_NAME).insert(item);
    }

    async function _findByWalletId(walletId) {
        return knex(TABLE_NAME).select().where({ walletId: walletId });
    }

    return Controller;
}
