import jwt from 'jsonwebtoken'
import db from './database.js'
import bcrypt from 'bcrypt'

// Kod hämtad från JWT-exemplet

function authenticateUser(userName, password) {
	console.log(userName, password)
	const match = db.data.users.find(user => user.name === userName)
	if (match) {
		let correctPassword = bcrypt.compareSync(password, match.password)
		if (correctPassword) {
			return true
		}
	} else {
		return false
	}
}

function createToken(name) {
	const user = { name: name }
	console.log('createToken: ', user, process.env.SECRET)
	const token = jwt.sign(user, process.env.SECRET, { expiresIn: '1h' })
	console.log('createToken: ', user, token)
	user.token = token
	console.log('createToken', user)
	return user
}

function userIsAuthorized(req) {
	// JWT skickas i request body, med querystring, eller i header: Authorization
	let token = req.body.token || req.query.token
	if (!token) {
		let x = req.headers['authorization']
		if (x === undefined) {
			// Vi hittade ingen token, authorization fail
			return false
		}
		token = x.substring(7)
		// Authorization: Bearer JWT......
		// substring(7) för att hoppa över "Bearer " och plocka ut JWT-strängen
	}

	console.log('Token: ', token)
	if (token) {
		let decoded
		try {
			decoded = jwt.verify(token, process.env.SECRET)
		} catch (error) {
			console.log('Catch! Felaktig token!!', error.message)
			return false
		}
		console.log('decoded: ', decoded)
		return true

	} else {
		console.log('Ingen token')
		return false
	}
}

export { createToken, authenticateUser, userIsAuthorized }
