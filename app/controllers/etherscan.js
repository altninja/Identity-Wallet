'use strict';

const Promise = require('bluebird');
const electron = require('electron');
const path = require('path');
const config = require('../config');
const request = require('request');
const async = require('async');


module.exports = function (app) {
    const API_KEY = null;
    const REQUEST_INTERVAL_DELAY = 600; // millis
    const RECORDS_COUNT = 1000;

    const API_ENDPOINT = "https://api.etherscan.io/api?module=account";
    const TX_LIST_ACTION = "&action=txlist&startblock=0&endblock=99999999&sort=asc";
    const TOKEN_TX_ACTION = "&action=tokentx&startblock=0&endblock=99999999&sort=asc";

    // TODO
    // 1) select wallets
    // 2) for each wallet -> select tokens
    // 3) for each token -> load txList for each of them (using paging)
    // 4) for each txListItem -> save txHistory & also save last synced item (into wallet_tokens)
    // TODO

    let queue = async.queue(async (args, callback) => {
        console.log("ETHERSCAN REQUESTS IN QUEUE: ", queue.length());
        let result = await makeRequest.apply(this, [args.method, args.url, args.data])
        setTimeout(() => {
            callback(result);
        }, REQUEST_INTERVAL_DELAY);
    }, 1);

    function loadEthTxHistory (address) {
        return new Promise ((resolve, reject) => {
            const ACTION_URL = API_ENDPOINT + TX_LIST_ACTION + "&address=" + address;
            queue.push({ method: "get", url: ACTION_URL }, (promise) => {
                resolve(promise);
            });
        })
    }

    function loadERCTxHistory (address) {
        return new Promise ((resolve, reject) => {
            const ACTION_URL = API_ENDPOINT + TOKEN_TX_ACTION + "&address=" + address;
            queue.push({ method: "get", url: ACTION_URL }, (promise) => {
                resolve(promise);
            });
        })
    }

    function makeRequest (method, url, data) {
        return new Promise((resolve, reject) => {
            request[method](url, (error, httpResponse, response) => {
                try {
                    response = JSON.parse(response);
                    resolve(response.result);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    const controller = function () { };

    controller.prototype.startSyncing = async () => {
        // Step 1: select wallets
        let wallets = await electron.app.sqlLite.wallet.findAll();

        for(let wallet of wallets) {
            console.log("wallet:", wallet);

            // lastUpdatedItem: 999
            // items count: 1000

            let ethTxList = await loadEthTxHistory("0x" + wallet.publicKey);
            let tokenTxList = await loadERCTxHistory("0x" + wallet.publicKey);

            console.log(">>>>>>> ethTxList")
            console.log(ethTxList);

            console.log(">>>>>>> tokenTxList")
            console.log(tokenTxList);
        }
    };

    return controller;
}



//https://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&page=1&offset=10&sort=asc

