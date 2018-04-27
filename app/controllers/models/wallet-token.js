const electron = require('electron');
const Promise = require('bluebird');

module.exports = function (knex) {

    const TABLE_NAME = 'wallet_tokens';
    const Controller = function () { };
    const helpers = electron.app.helpers;


    /**
     *
     */
    Controller.findAll = _findAll;
    Controller.findByWalletId = _findByWalletId;
    Controller.findById = _findById;
    Controller.add = _add;
    Controller.edit = _edit;

    /**
     *
     */
    async function _findAll() {
        let rows = await knex(TABLE_NAME).select().where({ recordState: 1 });
        return rows;
    }

    async function _findByWalletId(walletId) {
        try {
            return await knex(TABLE_NAME)
                .select('wallet_tokens.*', 'token_prices.name', 'token_prices.priceInUSD', 'tokens.symbol', 'tokens.decimal', 'tokens.address', 'tokens.isCustom')
                .leftJoin('tokens', 'tokenId', 'tokens.id')
                .leftJoin('token_prices', 'tokens.symbol', 'token_prices.symbol')
                .where({ walletId: walletId, recordState: 1 });
        } catch (e) {
            throw 'findByWalletId_error';
        }
    }

    async function _findById(id) {
        let rows = knex(TABLE_NAME)
            .select('wallet_tokens.*', 'token_prices.name', 'token_prices.priceInUSD', 'tokens.symbol', 'tokens.decimal', 'tokens.address', 'tokens.isCustom')
            .leftJoin('tokens', 'tokenId', 'tokens.id')
            .leftJoin('token_prices', 'tokens.symbol', 'token_prices.symbol')
            .where({ 'wallet_tokens.id': id, recordState: 1 });

        return rows && rows.length ? rows[0] : null;
    }

    function _add(tokenPrice) {
        return sqlLiteService.insertIntoTable(TABLE_NAME, tokenPrice);
    }

    function _edit(tokenPrice) {
        return sqlLiteService.updateById(TABLE_NAME, tokenPrice);
    }

    return Controller;
}
