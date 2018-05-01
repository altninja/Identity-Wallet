#!/usr/bin/env node

const electron = require('electron');
const knexMigrate = require('knex-migrate');
const path = require('path');
const config = { cwd: './app/controllers' };

module.exports = function () {

    let scope = this;

    this.init = async function () {
        try {
            const log = ({ action, migration }) => console.log('Doing ' + action + ' on ' + migration);
            await knexMigrate('up', config, log);

            scope.knex = require('knex')({
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: path.join(electron.app.getPath('userData'), 'IdentityWalletStorage.sqlite')
                }
            });

            _initModels();
        } catch (e) {
            console.log(">>>>", e);
        }
    }

    this.helper = {
        insertAndSelect: async (table, entity, tx) => {
            let qInsert = scope.knex(table);
            let qSelect = scope.knex(table);
            if(tx){
                qInsert = qInsert.transacting(tx);
                qSelect = qSelect.transacting(tx);
            }
            let insertedIds = await qInsert.insert(entity);
            let rows = await qSelect.where({id: insertedIds[0]});

            return rows[0];
        }
    }

    /**
     *
     */
    function _initModels() {
        scope.wallet = require('./models/wallet.js')(scope.knex);
        scope.appSetting = require('./models/app-setting.js')(scope.knex);
        scope.idAttributeType = require('./models/id-attribute-type.js')(scope.knex);
        scope.idAttribute = require('./models/id-attribute.js')(scope.knex, scope.helper);
        scope.token = require('./models/token.js')(scope.knex);
        scope.walletToken = require('./models/wallet-token.js')(scope.knex);
        scope.actionLog = require('./models/action-log.js')(scope.knex);
        scope.document = require('./models/document.js')(scope.knex);
        scope.exchangeMarket = require('./models/exchange-market.js')(scope.knex);
        scope.tokenPrice = require('./models/token-price.js')(scope.knex);
    }
}
