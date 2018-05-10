const electron = require('electron');

module.exports = function (knex) {
    const TABLE_NAME = 'tx_history';
    const Controller = function () { };
    const helpers = electron.app.helpers;


    /**
     *
     */
    Controller.findAll = _findAll;
    Controller.findByWalletId = _findByWalletId;
    Controller.findByWalletIdAndTokenId = _findByWalletIdAndTokenId;


    /**
     *
     */
    async function _findAll() {
        return await knex(TABLE_NAME).select();
    }

    async function _findByWalletId(publicKey) {
        let rows = await knex(TABLE_NAME).where({ from: publicKey }).orWhere({ to: publicKey });
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
