'use strict';

const Promise = require('bluebird');
const electron = require('electron');
const path = require('path');
const config = require('../config');
const request = require('request');
const async = require('async');

module.exports = function (app) {
    //"https://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&offset=10&sort=asc"

    const REQUEST_INTERVAL_DELAY = 600; // millis
    const RECORDS_COUNT = 1000;

    let API_ENDPOINT = "https://api.etherscan.io/api?module=account";

    let TX_LIST_ACTION = "&action=txlist&startblock=0&endblock=99999999&offset=" + RECORDS_COUNT + "&sort=asc";
    let TOKEN_TX_ACTION = "&action=tokentx&startblock=0&endblock=99999999&offset=" + RECORDS_COUNT + "&sort=asc";

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

    function loadTxHistory (address, page) {
        return new Promise ((resolve, reject) => {
            let ACTION_URL = API_ENDPOINT + TX_LIST_ACTION + "&address=" + address + "&page=" + page
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

        //let prm = await loadTxHistory("0x603fc6DAA3dBB1e052180eC91854a7D6Af873fdb", 1);
        //console.log("prm >>>> >>>>>>", prm);
        //return null;

        // Step 1: select wallets
        /*
        let wallets = await electron.app.sqlLiteService.Wallet.findActive();

        for(let wallet of wallets) {
            console.log("wallet:", wallet);

            // Step 2: select wallet tokens
            let walletTokens = await electron.app.sqlLiteService.WalletToken.findByWalletId(wallet.id);

            const walletTokensMap = {};
            for(let walletToken of walletTokens) {
                console.log("walletToken:", walletToken);
                walletTokensMap[walletToken.symbol] = {symbol: walletToken.symbol, tokenId: walletToken.tokenId};
            }

            let tokensTxList = loadTxHistory("0x" + wallet.publicKey, 1);
        }
        */
    };

    return controller;
}



//https://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&page=1&offset=10&sort=asc

