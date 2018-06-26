'use strict'

const path = require('path')
const electron = require('electron')
const log = require('electron-log')
const request = require('request')
const fs = require('fs')

const docs = path.resolve(electron.app.getPath('userData'), 'documents')

async function postMarketplaceAPI(args) {
	// electron.app.sqlLiteService.Document.findById(args.documentId)
	try {
		console.log('YESYESYALL')
		console.log(docs)
		console.log(args)
		const form = {
			first_name: args.form.first_name,
			last_name: args.form.last_name,
			email: args.form.email,
			password: args.form.password,
			passport: fs.createReadStream(path.join(docs, args.form.passport))
		}
		
		const options = {
			url: args.options.url, 
			method: args.options.method, 
			headers: {
		        "Content-Type": "multipart/form-data"
		    },
			formData: form
		}
		console.log(options)
		request.post(options, (err, res, body) => {
			if (err) return 'Error: ' + err
			if (res.statusCode === 201) {
				return 'Offer Joined Successfully'
			} else {
				return 'HTTP Error: ' + res.statusCode
			}
		})
	} catch (e) {
		return 'error' + e
	}		
}

module.exports = {
	postMarketplaceAPI
}
