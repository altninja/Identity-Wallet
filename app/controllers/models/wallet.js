const electron = require('electron');
const Promise = require('bluebird');

module.exports = function (knex) {

    const TABLE_NAME = 'wallets';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.add = _add;
    Controller.findAll = _findAll;
    Controller.addInitialIdAttributesAndActivate = _addInitialIdAttributesAndActivate;

    /*


    Controller.findActive = _findActive;

    Controller.findByPublicKey = _findByPublicKey;

    Controller.selectProfilePictureById = _selectProfilePictureById;
    Controller.updateProfilePicture = _updateProfilePicture;

    Controller.editImportedIdAttributes = _editImportedIdAttributes;
    */

    // DONE !!!!! ?????????
    async function _addInitialIdAttributesAndActivate(walletId, initialIdAttributes) {

        let tx = await helpers.promisify(knex.transaction);
        try {
            let wallets = await knex(TABLE_NAME).transacting(tx).select().where({ id: walletId });
            let wallet = wallets[0];

            let idAttributeTypes = await knex('id_attribute_types').transacting(tx).select().where({ isInitial: 1 });

            for (let i in idAttributeTypes) {

                let idAttributeType = idAttributeTypes[i];

                let item = {
                    walletId: wallet.id,
                    idAttributeType: idAttributeType.key,
                    items: [],
                    createdAt: new Date().getTime()
                };

                item.items.push({
                    "id": helpers.generateId(),
                    "name": null,
                    "isVerified": 0,
                    "order": 0,
                    "createdAt": new Date().getTime(),
                    "updatedAt": null,
                    "values": [{
                        "id": helpers.generateId(),
                        "staticData": { line1: initialIdAttributes[idAttributeType.key] },
                        "documentId": null,
                        "order": 0,
                        "createdAt": new Date().getTime(),
                        "updatedAt": null
                    }]
                });

                item.items = JSON.stringify(item.items);

                await knex('id_attributes').transacting(tx).insert(item);
            }

            wallet.isSetupFinished = 1;
            let updatedIds = await knex(TABLE_NAME).transacting(tx).update(wallet).where({ id: wallet.id });

            tx.commit();
            return wallet;
        } catch (e) {
            tx.rollback();
            throw 'error';
        }
    }


    async function _add(name, publicKey, keystoreFilePath) {
        let data = { name: name, publicKey: publicKey, keystoreFilePath: keystoreFilePath, createdAt: new Date().getTime() };
        let tx = await helpers.promisify(knex.transaction);
        try {
            let walletIds = await knex(TABLE_NAME).transacting(tx).insert(data);
            let walletId = walletIds[0];

            let walletTokenIds = await knex('wallet_tokens').transacting(tx).insert({ walletId: walletId, tokenId: 1, createdAt: new Date().getTime() });
            let wallets = await knex('wallet_tokens').transacting(tx).where({ id: walletId });

            tx.commit();
            return wallets[0]
        } catch (e) {
            tx.rollback();
            throw 'add_error';
        }
    }

    async function _findAll() {
        try {
            let rows = await knex(TABLE_NAME).select().whereNotNull('keystoreFilePath');
            return rows;
        } catch (e) {
            throw 'wallet_findAll_error';
        }
    }

    /*
    // DONE
    function _editImportedIdAttributes(walletId, initialIdAttributes) {
        return knex.transaction((trx) => {

            sqlLiteService.select(TABLE_NAME, "*", { id: walletId }, trx).then((rows) => {
                let wallet = rows[0]

                return new Promise((resolve, reject) => {
                    sqlLiteService.select('id_attribute_types', '*', { isInitial: 1 }, trx).then((idAttributeTypes) => {

                        let idAttributeTypesSelectPromises = [];
                        let idAttributesSavePromises = [];

                        let idAttributesToInsert = [];

                        for (let i in idAttributeTypes) {
                            let idAttributeType = idAttributeTypes[i];

                            idAttributeTypesSelectPromises.push(sqlLiteService.select('id_attributes', '*', { walletId: walletId, idAttributeType: idAttributeType.key }, trx).then((idAttributes)=>{
                                let idAttribute = null;

                                if(idAttributes && idAttributes.length === 1){
                                    idAttribute = idAttributes[0];
                                    idAttribute.items = JSON.parse(idAttribute.items);
                                    if(initialIdAttributes[idAttributeType.key]){
                                        idAttribute.items[0].values[0].staticData.line1 = initialIdAttributes[idAttributeType.key];
                                    }
                                    idAttribute.items = JSON.stringify(idAttribute.items);
                                }else{
                                    idAttribute = {
                                        walletId: wallet.id,
                                        idAttributeType: idAttributeType.key,
                                        items: [],
                                        createdAt: new Date().getTime()
                                    };

                                    idAttribute.items.push({
                                        "id": helpers.generateId(),
                                        "name": null,
                                        "isVerified": 0,
                                        "order": 0,
                                        "createdAt": new Date().getTime(),
                                        "updatedAt": null,
                                        "values": [{
                                            "id": helpers.generateId(),
                                            "staticData": { line1: initialIdAttributes[idAttributeType.key] },
                                            "documentId": null,
                                            "order": 0,
                                            "createdAt": new Date().getTime(),
                                            "updatedAt": null
                                        }]
                                    });
                                    idAttribute.items = JSON.stringify(idAttribute.items);
                                }

                                return idAttribute;
                            }));
                        }


                        Promise.all(idAttributeTypesSelectPromises).then((idAttributesList)=>{
                            let finalPromises = [];

                            for(let i in idAttributesList){
                                (function(){
                                    let idAttribute = idAttributesList[i];
                                    if(idAttribute.id){
                                        finalPromises.push(sqlLiteService.update('id_attributes', idAttribute, {id: idAttribute.id}, trx));
                                    }else{
                                        finalPromises.push(sqlLiteService.insertIntoTable('id_attributes', idAttribute, trx));
                                    }
                                })(i)
                            }

                            Promise.all(finalPromises).then((results)=>{
                                wallet.isSetupFinished = 1;
                                sqlLiteService.update('wallets', wallet, { id: wallet.id }, trx).then(() => {
                                    resolve(wallet);
                                }).catch((error) => {
                                    reject({ message: "wallets_insert_error", error: error });
                                });
                            }).catch((error)=>{
                                reject({ message: "wallets_insert_error", error: error });
                            });
                        }).catch((error)=>{
                            reject({ message: "wallets_insert_error", error: error });
                        })
                    }).catch((error) => {
                        reject({ message: "wallets_insert_error", error: error });
                    });
                });
            }).then(trx.commit).catch(trx.rollback);
        });
    }

    async function _findActive() {
        try {
            return await sqlLiteService.select(TABLE_NAME, '*', { isSetupFinished: 1 });
        } catch (e) {
            throw 'findActive_error';
        }
    }



    function _findByPublicKey(publicKey) {
        return new Promise((resolve, reject) => {
            sqlLiteService.select(TABLE_NAME, '*', { publicKey: publicKey }).then((rows) => {
                if (rows && rows.length === 1) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "wallet_findByPublicKey", error: error });
            })
        });
    }

    function _updateProfilePicture (args) {

        return knex.transaction((trx) => {
            let selectPromise = knex(TABLE_NAME).transacting(trx).select().where('id', args.id);
            selectPromise.then((rows) => {
                return new Promise((resolve, reject) => {
                    let wallet = rows[0];

                    wallet.profilePicture = args.profilePicture;

                    knex(TABLE_NAME).transacting(trx).update(wallet).where('id', args.id).then((updatedData) => {
                        resolve(wallet);
                    }).catch((error) => {
                        reject({ message: "error", error: error });
                    });
                });
            })
                .then(trx.commit)
                .catch(trx.rollback);
        });
    }

    function _selectProfilePictureById (args) {
        return new Promise((resolve, reject) => {
            knex(TABLE_NAME).select().where('id', args.id).then((rows) => {
                if (rows && rows.length) {
                    resolve(rows[0].profilePicture);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting_profile_picture", error: error });
            });
        });
    }
    */

    return Controller;
}
