const electron = require('electron');
const Promise = require('bluebird');

module.exports = function (knex, knexHelper) {

    const TABLE_NAME = 'id_attributes';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    Controller.create = _create;
    Controller.delete = _delete;

    //Controller.selectById = selectById;

    Controller.addEditDocumentOfIdAttributeItemValue = _addEditDocumentOfIdAttributeItemValue;
    Controller.addEditStaticDataOfIdAttributeItemValue = _addEditStaticDataOfIdAttributeItemValue;

    Controller.findAllByWalletId = _findAllByWalletId;
    Controller.addImportedIdAttributes = _addImportedIdAttributes;


    /**
     *
     */
    async function _create(walletId, idAttributeType, staticData, file) {
        let tx = await helpers.promisify(knex.transaction);

        try {
            let idAttributes = await knex(TABLE_NAME).transacting(tx).select().where({ walletId: walletId, idAttributeType: idAttributeType });
            if (idAttributes && idAttributes.length) {
                tx.rollback();
                throw 'id_attribute_already_exists';
            }

            let idAttribute = null;
            let document = null;

            if (file) {
                file.createdAt = new Date().getTime();
                delete file.path;
                document = await knexHelper.insertAndSelect('documents', file, tx);
            }

            idAttribute = helpers.generateIdAttributeObject(walletId, idAttributeType, staticData, document);
            idAttribute.items = JSON.stringify(idAttribute.items);
            idAttribute = await knexHelper.insertAndSelect(TABLE_NAME, idAttribute, tx);
            tx.commit();
            return idAttribute;
        } catch (e) {
            tx.rollback();
            throw 'error';
        }
    }

    async function _addEditDocumentOfIdAttributeItemValue(idAttributeId, idAttributeItemId, idAttributeItemValueId, file) {
        let rows = await knex(TABLE_NAME).select().where({ id: idAttributeId });
        if (!rows || !rows.length) {
            throw "id_attribute_not_found";
        }
        let idAttribute = rows[0];

        idAttribute.items = JSON.parse(idAttribute.items);

        let item = helpers.getRecordById(idAttribute.items, idAttributeItemId);
        if (!item) {
            throw "id_attribute_item_not_found";
        }

        if (!item.values || !item.values.length) {
            throw "id_attribute_item_value_not_found";
        }

        let value = helpers.getRecordById(item.values, idAttributeItemValueId);
        if(!value){
            throw "value_not_found";
        }

        let tx = await helpers.promisify(knex.transaction);

        try {
            let document = {
                buffer: file.buffer,
                name: file.name,
                mimeType: file.mimeType,
                size: file.size,
                createdAt: new Date().getTime()
            };

            if (value.documentId) {
                document.id = value.documentId;
                document.updatedAt = new Date().getTime();
                await knex('documents').transacting(tx).update(document).where({ id: value.documentId });
            } else {
                let insertedIds = await knex('documents').transacting(tx).insert(document);
                value.documentId = insertedIds[0];
            }

            value.documentName = document.name;
            idAttribute.items = JSON.stringify(idAttribute.items);
            await knex(TABLE_NAME).transacting(tx).update(idAttribute).where({ 'id': idAttribute.id });

            tx.commit();
            return idAttribute;
        } catch (e) {
            tx.rollback();
            throw 'id_attributes_error';
        }
    }

    async function _addEditStaticDataOfIdAttributeItemValue(idAttributeId, idAttributeItemId, idAttributeItemValueId, staticData) {
        let tx = await helpers.promisify(knex.transaction);
        try {
            let idAttributes = await knex(TABLE_NAME).transacting(tx).select().where({ id: idAttributeId })

            if (!idAttributes || !idAttributes.length) {
                throw "id_attribute_not_found";
            }

            let idAttribute = idAttributes[0];
            idAttribute.items = JSON.parse(idAttribute.items);

            let value = helpers.getIdAttributeItemValue(idAttribute, idAttributeItemId, idAttributeItemValueId);

            value.staticData = staticData;

            idAttribute.items = JSON.stringify(idAttribute.items);
            idAttribute.updatedAt = new Date().getTime();

            let updatedIds = await knex(TABLE_NAME).transacting(tx).update(idAttribute).where({ id: idAttribute.id });
            idAttribute.items = JSON.parse(idAttribute.items);

            tx.commit();
            return idAttribute;
        } catch (e) {
            tx.rollback();
            throw 'error';
        }
    }

    async function _findAllByWalletId(walletId) {
        let rows = await knex(TABLE_NAME).select().where({ 'walletId': walletId });
        if (!rows || !rows.length) {
            return [];
        }

        let idAttributes = {};

        for (let i in rows) {
            let idAttribute = rows[i];

            if (!idAttribute) continue;

            if (temp__checkType(idAttributes, idAttribute.idAttributeType)) {
                continue;
            }

            idAttribute.items = JSON.parse(idAttribute.items);
            idAttributes[idAttribute.id] = idAttribute;
        }

        return idAttributes;
    }

    async function _delete(idAttributeId, idAttributeItemId, idAttributeItemValueId) {
        let tx = await helpers.promisify(knex.transaction);
        try {
            let idAttributes = await knex(TABLE_NAME).transacting(tx).select().where({ 'id': idAttributeId });
            let idAttribute = idAttributes[0];

            let value = helpers.getIdAttributeItemValue(idAttribute, idAttributeItemId, idAttributeItemValueId);
            if (value && value.documentId) {
                await knex('documents').transacting(tx).del().where({ 'id': value.documentId });
            }

            await knex(TABLE_NAME).transacting(tx).del().where({ 'id': idAttribute.id });
            tx.commit();
        } catch (e) {
            throw 'error';
        }
    }

    async function _addImportedIdAttributes(walletId, exportCode, requiredDocuments, requiredStaticData) {

        let wallets = await knex('wallets').select().where({ id: walletId });
        if (!wallets || !wallets.length) {
            throw 'wallet_not_found';
        }

        let wallet = wallets[0];

        let tx = await helpers.promisify(knex.transaction);

        try {
            let idAttributesSavePromises = [];
            let documentsSavePromises = [];

            let itemsToSave = {};

            for (let i in requiredDocuments) {
                let requirement = requiredDocuments[i];
                if (!requirement.attributeType) continue;

                let idAttribute = helpers.generateEmptyIdAttributeObject(walletId, requirement.attributeType);
                idAttribute.tempId = helpers.generateId();

                for (let j in requirement.docs) {
                    let fileItems = requirement.docs[j].fileItems;
                    let idAttributeItem = helpers.generateEmptyIdAttributeItemObject();
                    idAttribute.items.push(idAttributeItem);

                    for (let k in fileItems) {
                        let fileItem = fileItems[k];
                        let idAttributeItemValue = helpers.generateEmptyIdAttributeItemValueObject();
                        idAttributeItem.values.push(idAttributeItemValue);

                        let document = {
                            name: fileItem.name,
                            mimeType: fileItem.mimeType,
                            size: fileItem.size,
                            buffer: fileItem.buffer,
                            createdAt: new Date().getTime()
                        };

                        document = await knexHelper.insertAndSelect('documents', document, tx);
                        idAttributeItemValue.documentId = document.id;
                        idAttributeItemValue.documentName = document.name;
                        itemsToSave[idAttribute.tempId] = idAttribute;
                    }
                }
            }

            for (let i in requiredStaticData) {
                let requirement = requiredStaticData[i];
                if (!requirement.attributeType) continue;

                let staticData = {};
                for (let j in requirement.staticDatas) {
                    let answer = requirement.staticDatas[j];
                    staticData["line" + (parseInt(j) + 1).toString()] = answer;
                }

                let idAttribute = helpers.generateIdAttributeObject(walletId, requirement.attributeType, staticData, null);
                idAttribute.tempId = helpers.generateId();

                itemsToSave[idAttribute.tempId] = idAttribute;
            }

            for (let i in itemsToSave) {
                delete itemsToSave[i].tempId;
                itemsToSave[i].items = JSON.stringify(itemsToSave[i].items);
                await knexHelper.insertAndSelect('id_attributes', itemsToSave[i], tx);
            }

            wallet.airDropCode = exportCode;

            await knex('wallets').transacting(tx).update(wallet).where({ id: wallet.id });
            tx.commit();
            return wallet;
        } catch (e) {
            tx.rollback();
            throw 'error';
        }
    }

    function selectById(id, trx) {
        return new Promise((resolve, reject) => {

            let selectQuery = sqlLiteService.select(TABLE_NAME, "*", { id: id }, trx);
            selectQuery.then((rows) => {
                if (!rows || !rows.length) {
                    return reject({ message: 'not_found' });
                }

                let idAttribute = null;

                let idAttributeItemPromises = [];
                let idAttributeItemValuesPromises = [];

                idAttribute = rows[0];


                idAttributeItemPromises.push(sqlLiteService.select('id_attribute_items', '*', { idAttributeId: idAttribute.id }, trx).then((items) => {
                    idAttribute.items = items ? items : [];

                    for (let j in items) {
                        idAttributeItemValuesPromises.push(selectIdAttributeItemValueView({ idAttributeItemId: items[j].id }, trx).then((values) => {
                            if (values) {
                                for (let i in values) {
                                    if (values[i].staticData) {
                                        values[i].staticData = JSON.parse(values[i].staticData);
                                    }
                                }
                                items[j].values = values;
                            } else {
                                items[j].values = [];
                            }
                        }));
                    }
                }));

                Promise.all(idAttributeItemPromises).then((items) => {
                    Promise.all(idAttributeItemValuesPromises).then((values) => {
                        resolve(idAttribute);
                    }).catch((error) => {
                        reject({ message: "error_while_selecting", error: error });
                    });
                }).catch((error) => {
                    reject({ message: "error_while_selecting", error: error });
                });
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    function selectIdAttributeItemValueView(where, trx) {
        return new Promise((resolve, reject) => {

            let query = knex('id_attribute_item_values');

            if (trx) {
                query = query.transacting(trx);
            }

            let promise = query
                .select('id_attribute_item_values.*', 'documents.name as documentFileName', 'id_attribute_items.id as idAttributeItemId', 'id_attributes.id as idAttributeId', 'id_attributes.idAttributeType', 'id_attributes.walletId')
                .leftJoin('id_attribute_items', 'id_attribute_item_values.idAttributeItemId', 'id_attribute_items.id')
                .leftJoin('id_attributes', 'id_attribute_items.idAttributeId', 'id_attributes.id')
                .leftJoin('documents', 'id_attribute_item_values.documentId', 'documents.id')
                .where(where);

            promise.then((rows) => {
                resolve(rows);
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    function temp__checkType(idAttributes, idAttributeType) {
        for (let i in idAttributes) {
            if (idAttributes[i].idAttributeType === idAttributeType) {
                return true;
            }
        }
        return false;
    }

    return Controller;
}
