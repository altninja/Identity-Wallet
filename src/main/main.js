'use strict';
const path = require('path');
const fs = require('fs');
const url = require('url');
const electron = require('electron');
const os = require('os');
const { Menu, Tray, autoUpdater } = require('electron');
const isOnline = require('is-online');
const config = buildConfig(electron);

const log = require('electron-log');

log.transports.file.level = true;
log.transports.console.level = true;

log.transports.console.level = 'info';

log.info('starting: ' + electron.app.getName());

const userDataDirectoryPath = electron.app.getPath('userData');
const walletsDirectoryPath = path.resolve(userDataDirectoryPath, 'wallets');
const documentsDirectoryPath = path.resolve(userDataDirectoryPath, 'documents');

const createMenuTemplate = require('./menu');

/**
 * auto updated
 */
const { appUpdater } = require('./autoupdater');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	log.info('missing: electron-squirrel-startup');
	process.exit(0);
}

const app = {
	dir: {
		root: __dirname + '/../',
		desktopApp: __dirname + '/../app'
	},
	config: {
		app: config,
		user: null
	},
	translations: {},
	win: {},
	log: log
};

const i18n = ['en'];

let shouldIgnoreClose = true;
let shouldIgnoreCloseDialog = false; // in order to don't show prompt window
let mainWindow;

for (let i in i18n) {
	app.translations[i18n[i]] = require('./i18n/' + i18n[i] + '.js');
}

if (!handleSquirrelEvent()) {
	electron.app.on('window-all-closed', onWindowAllClosed());
	electron.app.on('activate', onActivate(app));
	electron.app.on('web-contents-created', onWebContentsCreated);
	electron.app.on('ready', onReady(app));
}

let isSecondInstance = electron.app.makeSingleInstance((commandLine, workingDirectory) => {
	// Someone tried to run a second instance, we should focus our window.
	if (app.win && Object.keys(app.win).length) {
		if (app.win.isMinimized()) app.win.restore();
		app.win.focus();
	}
	return true;
});

/**
 *
 */
function onReady(app) {
	return async () => {
		global.__static = __static;

		if (isSecondInstance) {
			electron.app.quit();
			return;
		}

		if (process.env.NODE_ENV !== 'development' && process.env.MODE !== 'test') {
			// Initate auto-updates
			appUpdater();
		}

		const initDb = require('./services/knex').init;

		await initDb();

		app.config.userDataPath = electron.app.getPath('userData');

		electron.app.helpers = require('./controllers/helpers')(app);

		const CMCService = require('./controllers/cmc-service')(app);
		electron.app.cmcService = new CMCService();

		const AirtableService = require('./controllers/airtable-service')(app);
		electron.app.airtableService = new AirtableService();

		const SqlLiteService = require('./controllers/sql-lite-service')(app);
		electron.app.sqlLiteService = new SqlLiteService();

		const LedgerService = require('./controllers/ledger-service')(app);
		electron.app.ledgerService = new LedgerService();

		const Web3Service = require('./controllers/web3-service')(app);
		electron.app.web3Service = new Web3Service();

		const RPCHandler = require('./controllers/rpc-handler')(app);
		electron.app.rpcHandler = new RPCHandler();
		electron.app.rpcHandler.startTokenPricesBroadcaster(electron.app.cmcService);

		const TxHistory = require('./controllers/tx-history-service').default(app);
		electron.app.txHistory = new TxHistory();

		createKeystoreFolder();

		// TODO
		// 1) load ETH & KEY icons & prices
		// 2) insert tokenPrices - set icon & price
		// 3) notify angular app when done

		if (electron.app.dock) {
			electron.app.dock.setIcon(__static + '/assets/icons/png/newlogo-256x256.png');
		}

		mainWindow = new electron.BrowserWindow({
			title: electron.app.getName(),
			width: 1170,
			height: 800,
			minWidth: 1170,
			minHeight: 800,
			webPreferences: {
				nodeIntegration: false,
				webSecurity: true,
				disableBlinkFeatures: 'Auxclick',
				preload: path.resolve(__dirname, 'preload.js')
			},
			icon: __static + '/assets/icons/png/newlogo-256x256.png'
		});

		Menu.setApplicationMenu(Menu.buildFromTemplate(createMenuTemplate(mainWindow)));

		const webAppPath = isDevMode()
			? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/index.html`
			: `file://${__dirname}/index.html`;

		mainWindow.loadURL(webAppPath);

		if (isDebugging()) {
			log.info('app is running in debug mode');
			mainWindow.webContents.openDevTools();
		}

		mainWindow.webContents.openDevTools();

		mainWindow.on('close', event => {
			if (shouldIgnoreCloseDialog) {
				shouldIgnoreCloseDialog = false;
				return;
			}
			if (shouldIgnoreClose) {
				event.preventDefault();
				shouldIgnoreClose = false;
				mainWindow.webContents.send('SHOW_CLOSE_DIALOG');
			}
		});

		mainWindow.on('closed', () => {
			mainWindow = null;
		});

		mainWindow.webContents.on('did-finish-load', () => {
			isOnline()
				.then(isOnline => {
					log.info('is-online', isOnline);
					if (!isOnline) {
						mainWindow.webContents.send('SHOW_IS_OFFLINE_WARNING');
						return;
					}

					log.info('did-finish-load');
					mainWindow.webContents.send('APP_START_LOADING');
					//start update cmc data
					electron.app.cmcService.startUpdateData();
					electron.app.airtableService.loadIdAttributeTypes();
					electron.app.airtableService.loadExchangeData();
					electron.app.txHistory.startSyncingJob();
					mainWindow.webContents.send('APP_SUCCESS_LOADING');
				})
				.catch(error => {
					log.error(error);
					mainWindow.webContents.send('APP_FAILED_LOADING');
				});
		});

		mainWindow.webContents.on('did-fail-load', () => {
			log.error('did-fail-load');
		});

		// TODO - check
		electron.ipcMain.on('ON_CONFIG_CHANGE', (event, userConfig) => {
			log.info('ON_CONFIG_CHANGE');
			app.config.user = userConfig;
		});

		electron.ipcMain.on('ON_RPC', (event, actionId, actionName, args) => {
			if (electron.app.rpcHandler[actionName]) {
				electron.app.rpcHandler[actionName](event, actionId, actionName, args);
			}
		});

		electron.ipcMain.on('ON_CLOSE_DIALOG_CANCELED', event => {
			shouldIgnoreClose = true;
		});

		electron.ipcMain.on('ON_IGNORE_CLOSE_DIALOG', event => {
			shouldIgnoreCloseDialog = true;
		});

		// TODO: Refactor this away
		app.win = mainWindow;

		/**
		 * LWS ID Wallet Main Process Integration
		 **/

		// paste at bottom app ready function in /app/main.js

		// IDW listening on app startup
		// BE pings IDW and establish 2way secure comms
		// Default comms using Native Messagins with API fallback if NM fails or testing
		// IDW query SQLite for existing wallets and returns result to BE
		// BE UI select pubkey (wallet) and eq IDW
		// IDW listens in app.run uses rootscope wallet of pubky checks for privkey
		// IDW signs challenge function with nonce and privkey and returns signature back to BE

		/**
		 * LWS ID Wallet Main Process Integration
		 **/

		/**
		 * LWSInit begin
		 **/

		electron.ipcMain.on('LWSInit', (event, arg) => {
			/**
			 * LWS Common
			 */
			const request = require('request');
			const ethUtil = require('ethereumjs-util');
			const keythereum = require('./extended_modules/keythereum');
			const knex = require('knex')({
				client: 'sqlite3',
				useNullAsDefault: true,
				connection: {
					filename: path.join(
						electron.app.getPath('userData'),
						'IdentityWalletStorage.sqlite'
					)
				}
			});

			// takes the claim object + nonce provided by the server and the private key from the wallet and creates a signature
			function signChallenge(claim, privKey) {
				return new Promise(resolve => {
					const msgHash = ethUtil.hashPersonalMessage(Buffer.from(claim, 'hex')); // hash the claim object
					const signature = ethUtil.ecsign(msgHash, Buffer.from(privKey, 'hex')); // create the signature
					resolve(signature); // resolve signature
				});
			}

			// helper function to send message to render process requesting a private key
			function reqPrivKey(pubKey) {
				return new Promise(resolve => {
					// resolve send public key to renderer process
					resolve(app.win.webContents.send('reqPrivKey', pubKey));
				});
			}

			// helper function to listen for response from renderer process with private key
			function resPrivKey() {
				return new Promise(resolve => {
					// set listener for private key
					electron.ipcMain.on('resPrivKey', (event, msg) => {
						// resolve message from renderer process
						resolve(msg);
					});
				});
			}

			// check individual wallet is unlocked
			async function checkWallet(pubKey) {
				return new Promise(resolve => {
					reqPrivKey(pubKey).then(() => resPrivKey().then(msg => resolve(msg)));
				});
			}

			// check if any wallets are unlocked
			async function checkWallets(wallets) {
				let checkedWallets = [];
				for (let wallet of wallets) {
					const check = await checkWallet(wallet.publicKey);
					let walletObj = {
						id: wallet.id,
						pubKey: wallet.publicKey,
						unlocked: check.status
					};
					checkedWallets.push(walletObj);
				}
				return checkedWallets;
			}

			// TODO: filter query results
			function getWallets() {
				return new Promise((resolve, reject) => {
					knex('wallets')
						.select()
						.then(result => {
							result.length
								? checkWallets(result).then(allWallets => resolve(allWallets))
								: reject('No wallets found');
						});
				});
			}

			// TODO: filter query result
			function getWallet(pubKey) {
				return new Promise((resolve, reject) => {
					knex('wallets')
						.select('*')
						.where({ publicKey: pubKey })
						.then(result => {
							if (result.length === 1) {
								resolve(result[0]);
							} else {
								resolve({ message: 'No wallets found' });
							}
						});
				});
			}

			function checkUserInfo(result, wid, required) {
				return new Promise((resolve, reject) => {
					var fullInfo = [];
					for (let info of result) {
						const field = info.idAttributeType;
						const p = JSON.parse(info.items);
						const value = p[0].values[0].staticData.line1;
						const id = info.walletId;
						const r = JSON.parse(required);
						if (value !== undefined && id == wid) {
							for (let require of r) {
								if (require == field) {
									const infoObj = {
										tag: require,
										display: require,
										value: value
									};
									fullInfo.push(infoObj);
								}
							}
						}
					}
					resolve(fullInfo);
				});
			}

			function getUserInfo(wid, required) {
				return new Promise((resolve, reject) => {
					knex('id_attributes')
						.select()
						.then(result => {
							result.length
								? checkUserInfo(result, wid, required).then(userInfo =>
										resolve(userInfo)
								  )
								: reject('User info error');
						});
				});
			}

			// check if a password can unlock a keystore file
			function getPassword(pubKey, password) {
				return new Promise((resolve, reject) => {
					getWallet(pubKey).then(wallet => {
						if (wallet.message) {
							reject(wallet.message);
						} else {
							let keystoreFileFullPath = path.join(
								walletsDirectoryPath,
								wallet.keystoreFilePath
							);
							keythereum.importFromFile(keystoreFileFullPath, keystoreObject => {
								try {
									let privateKey = keythereum.recover(password, keystoreObject);
									const data = {
										id: wallet.id,
										isSetupFinished: wallet.isSetupFinished,
										privateKey: privateKey,
										publicKey: keystoreObject.address,
										keystoreFilePath: wallet.keystoreFilePath
									};
									app.win.webContents.send('lwsUnlock', data);
									resolve({
										message: 'Password correct',
										pubKey: keystoreObject.address
									});
								} catch (e) {
									reject('Incorrect Password');
								}
							});
						}
					});
				});
			}

			//"claim": {
			//     "did": "did:key:0x1234",
			//     "attributes": {
			//       "first_name": "Benjamin",
			//       "middle_name": "Stephen",
			//       "last_name": "Gervais",
			//       "email": "ben@selfkey.org",
			//       "country_of_residency": "Canada"
			//     },
			//     "stake": [
			//       {
			//         "token": "KEY",
			//         "balance": 1000
			//       }
			//     ]
			//   }
			// build claim object
			function buildClaim(wid, pubKey, config) {
				return new Promise((resolve, reject) => {
					const c = JSON.parse(config);
					getUserInfo(wid, JSON.stringify(c.attributes)).then(attributes => {
						resolve({
							claim: {
								did: 'did:key:0x' + pubKey,
								attributes: attributes,
								stake: c.stake
							}
						});
					});
					// get DID (did:key:0x + pubKey)
					// get ID attributes (check server config, check available details)
					// get stake requirements forom server config
					// concat nonce
				});
			}
			//  {
			//   "id": "1",
			//   "type": [
			//     "first_name",
			//     "middle_name",
			//     "last_name",
			//     "email",
			//     "country_of_residency"
			//   ],
			//   "issuer": "self-attested",
			//   "issued": "2018-01-01",
			//   "claim": {
			//     "did": "did:key:0x1234",
			//     "attributes": {
			//       "first_name": "Benjamin",
			//       "middle_name": "Stephen",
			//       "last_name": "Gervais",
			//       "email": "ben@selfkey.org",
			//       "country_of_residency": "Canada"
			//     },
			//     "stake": [
			//       {
			//         "token": "KEY",
			//         "balance": 1000
			//       }
			//     ]
			//   },
			//   "proof": {
			//     "type": "ClaimSignature",
			//     "created": "2018-06-18T21:19:10Z",
			//     "address": "0x1234",
			//     "nonce": "86e6a0e86e6a0e73886e6a0e73886e6a0e738",
			//     "signature": "BavEll0/I1zpYw8XNi1bgVg/sCneO4Jugez8RwDg/+MCRVpjOboDoe4SxxKjkCOvKiCHGDvc4krqi6Z1n0UfqzxGfmatCuFibcC1wpsPRdW+gGsutPTLzvueMWmFhwYmfIFpbBu95t501+rSLHIEuujM/+PXr9Cky6Ed+W3JT24="
			//   }
			// }
			// build credentials object
			function buildCredentials() {
				return { test: 'Yo' };
				// add ID (what how?)
				// type array is requested info from server config
				// issuer static string "self attested"
				// issued create new todays date
				// add claim object
				// create proof object
				// type: static
				// date: samee as issued date
				// address = pubKey
				// nonce from server
				// signature from SK lib function
				// return full object
			}

			//
			function getSignature(pubKey, challenge) {
				return new Promise((resolve, reject) => {
					checkWallet(pubKey).then(msg => {
						if (msg.privKey) {
							signChallenge(challenge, msg.privKey).then(signature => {
								resolve(signature);
							});
						} else {
							reject('Error generating signature');
						}
					});
				});
			}

			function native() {
				return new Promise((resolve, reject) => {
					resolve('OK');
				});
			}

			function submitData(args) {
				return new Promise((resolve, reject) => {
					try {
						const f = args.form;
						const form = {
							email: f.email,
							password: f.password,
							first_name: f.first_name,
							last_name: f.last_name,
							dob: f.dob,
							country: f.country,
							home_phone: f.home_phone,
							mobile_phone: f.mobile_phone,
							address_1: f.address_1,
							address_2: f.address_2,
							city: f.city,
							state: f.state,
							postal: f.postal,
							country_code: f.country_code,
							document: fs.createReadStream(path.join(docs, f.document)),
							document_number: f.document_number,
							issuing_country: f.issuing_country,
							mime_type: f.mime_type
						};
						const options = {
							url: args.options.url,
							method: args.options.method,
							headers: {
								'Content-Type': 'multipart/form-data'
							},
							formData: form
						};
						console.log(options);
						request.post(options, (err, res, body) => {
							if (err) return 'Error: ' + err;
							if (res.statusCode === 201) {
								return 'Offer Joined Successfully';
							} else {
								return 'HTTP Error: ' + res.statusCode;
							}
						});
					} catch (e) {
						return 'error' + e;
					}
				});
			}
			/**
			 * LWS Common end
			 */

			/**
			 * LWS API
			 */

			const express = require('express');
			const api = express();
			const bodyParser = require('body-parser');

			api.use(bodyParser.json());
			api.use(bodyParser.urlencoded({ extended: true }));
			api.set('port', 3885);

			// blank endpoint for BE to test connection
			api.get('/', (req, res) => {
				native()
					.then(() => res.status(200).json({ message: 'Service Functioning' }))
					.catch(e => res.status(500).json({ message: e }));
			});

			api.get('/wallet', (req, res) => {
				checkWallet(req.query.pubKey)
					.then(check => res.status(200).json(check))
					.catch(e => res.status(500).json({ message: e }));
			});

			// get all the wallets available
			api.get('/wallets', (req, res) => {
				getWallets()
					.then(allWallets => res.status(200).json(allWallets))
					.catch(e => res.status(500).json({ message: e }));
			});

			api.get('/info', (req, res) => {
				getUserInfo(req.query.wid, req.query.required)
					.then(userInfo => res.status(200).json(userInfo))
					.catch(e => res.status(500).json({ message: e }));
			});

			// checks a password vs pubKey
			api.get('/password', (req, res) => {
				getPassword(req.query.pubKey, req.query.password)
					.then(check => res.status(200).json(check))
					.catch(e => res.status(500).json(e));
			});

			// get the private key from the requested wallet and return a signature
			api.get('/signature', (req, res) => {
				getSignature(req.query.pubKey, req.query.challenge)
					.then(signature => res.status(200).json(signature))
					.catch(e => res.status(500).json({ message: e }));
			});

			api.get('/claim', (req, res) => {
				buildClaim(req.query.wid, req.query.pubKey, req.query.config)
					.then(claim => res.status(200).json(claim))
					.catch(e => res.status(500).json({ message: e }));
			});

			api.get('/credentials', (req, res) => {
				buildCredentials()
					.then(credentials => res.status(200).json(credentials))
					.catch(e => res.status(500).json({ message: e }));
			});

			api.post('/submit', (req, res) => {
				submitData(args)
					.then((success = res.status(201).json(success)))
					.catch(e => res.status(500).json({ message: e }));
			});

			// start the api and wait for requests
			api.listen(api.get('port'), () => console.log('IDWAPI: ', api.get('port')));
			/**
			 * LWS API end
			 */

			// LWS Websockets

			const WebSocket = require('ws');

			const wss = new WebSocket.Server({ port: 8898 });

			wss.on('connection', function connection(ws) {
				ws.send('IDW WS UP');

				ws.on('message', function incoming(message) {
					console.log(message);
					var p = JSON.parse(message);

					if (p.i === 'wallets') {
						getWallets().then(allWallets => {
							console.log(allWallets);
							ws.send(JSON.stringify(allWallets));
						});
					}

					if (p.i === 'wallet') {
						checkWallet(p.pubKey).then(check => {
							console.log(check);
							ws.send(JSON.stringify(check));
						});
					}

					if (p.i === 'info') {
						getUserInfo(p.wid, p.required).then(userInfo => {
							console.log(userInfo);
							ws.send(JSON.stringify(userInfo));
						});
					}

					if (p.i === 'password') {
						getPassword(p.pubKey, p.password).then(check => {
							console.log(check);
							ws.send(JSON.stringify(check));
						});
					}

					if (p.i === 'signature') {
						getSignature(p.pubKey, p.challenge).then(signature => {
							console.log(signature);
							ws.send(JSON.stringify(signature));
						});
					}
				});
			});
			/**
			 * LWS Websockets end
			 */
		});
		/**
		 * LWSInit end
		 */
	};
}

function onActivate(app) {
	log.info('onActivate');
	return function() {
		if (app.win === null) {
			onReady(app);
		}
	};
}

function onWindowAllClosed() {
	return () => {
		return electron.app.quit();
	};
}

function onWebContentsCreated(event, contents) {
	contents.on('will-attach-webview', (event, webPreferences, params) => {
		delete webPreferences.preload;
		delete webPreferences.preloadURL;

		// Disable node integration
		webPreferences.nodeIntegration = false;
		webPreferences.sandbox = true;

		let found = false;
		for (let i in config.common.allowedUrls) {
			if (params.src.startsWith(config.common.allowedUrls[i])) {
				found = true;
				break;
			}
		}

		if (!found) {
			return event.preventDefault();
		}
	});
}

function createKeystoreFolder() {
	if (!fs.existsSync(walletsDirectoryPath)) {
		fs.mkdir(walletsDirectoryPath);
	}

	if (!fs.existsSync(documentsDirectoryPath)) {
		fs.mkdir(documentsDirectoryPath);
	}
}

/**
 *
 */
function handleSquirrelEvent() {
	log.info('started handleSquirrelEvent');

	if (process.argv.length === 1) {
		return false;
	}

	const ChildProcess = require('child_process');

	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = 'Identity-Wallet-Installer.exe';

	const spawn = function(command, args) {
		let spawnedProcess, error;

		try {
			spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
		} catch (error) {}

		return spawnedProcess;
	};

	const spawnUpdate = function(args) {
		return spawn(updateDotExe, args);
	};

	const squirrelEvent = process.argv[1];
	switch (squirrelEvent) {
		case '--squirrel-install':
		case '--squirrel-updated':
			// Optionally do things such as:
			// - Add your .exe to the PATH
			// - Write to the registry for things like file associations and
			//   explorer context menus

			// Install desktop and start menu shortcuts
			spawnUpdate(['--createShortcut', exeName]);

			setTimeout(electron.app.quit, 1000);
			return true;

		case '--squirrel-uninstall':
			// Undo anything you did in the --squirrel-install and
			// --squirrel-updated handlers

			// Remove desktop and start menu shortcuts
			spawnUpdate(['--removeShortcut', exeName]);

			setTimeout(electron.app.quit, 1000);
			return true;

		case '--squirrel-obsolete':
			// This is called on the outgoing version of your app before
			// we update to the new version - it's the opposite of
			// --squirrel-updated

			electron.app.quit();
			return true;
	}
	log.info('end handleSquirrelEvent');
}

/**
 *
 */
function isDevMode() {
	if (process.env.NODE_ENV === 'development') {
		return true;
	}
	return false;
}

function isDebugging() {
	if (process.env.DEV_TOOLS === 'yes') {
		return true;
	}
	return false;
}

function buildConfig(electron) {
	let config = require('./config');

	const envConfig = isDevMode() || isDebugging() ? config.default : config.production;
	config = Object.assign(config, envConfig);

	delete config.default;
	delete config.production;

	return config;
}
