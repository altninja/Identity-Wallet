const ethTokensList = require('./../../../assets/data/eth-tokens.json');

const electron = require('electron');

module.exports = function (knex) {
    const TABLE_NAME = 'tokens';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.findAll = _findAll;
    Controller.findById = _findById;


    async function _findAll() {
        try {
            // TODO (networkId: 1 .. TEMP while there isn't support for testNet )
            return await knex(TABLE_NAME).select().where({networkId: 1});
        } catch (e) {
            throw 'tokens_findAll_error';
        }
    }

    async function _findById(id) {
        try {
            let rows = await knex(TABLE_NAME).select().where({id: id});

            if(rows && rows.length === 1){
                return rows[0]
            }

            return null;
        } catch (e) {
            throw 'tokens_findById_error';
        }
    }
    return Controller;
}
