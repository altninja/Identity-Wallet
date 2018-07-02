'use strict';

const path = require('path');
const electron = require('electron');
const log = require('electron-log');
const request = require('request');
const fs = require('fs');

const docs = path.resolve(electron.app.getPath('userData'), 'documents');

async function postMarketplaceAPI(args) {
	// electron.app.sqlLiteService.Document.findById(args.documentId)
	try {
		console.log('YESYESYALL');
		console.log(docs);
		console.log(args);
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
}

module.exports = {
	postMarketplaceAPI
};
