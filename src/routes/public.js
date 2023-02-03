import express from 'express'
import { isValidMessage, isNonEmptyString } from '../validate.js'
import db from '../database.js'
const router = express.Router()
let date = new Date();
// get the date as a string
let n = date.toDateString();
// get the time as a string
let time = date.toLocaleTimeString();

let dateTime = n + ':' + time;


// unique guest username
const guestUser = 'guest' + Math.floor(Math.random() * 1000)
router.get('/public', (req, res) => {
	res.status(200).send(db.data.messagesPublic)
	console.log(db.data.messagesPublic)
})
let userMessage = {
	user: '',
	message: '',
	date: dateTime
}

router.post('/', async (req, res) => {
	await db.read()
	const message = req.body.userMessage
	const currentUser = req.body.currentUser
	if (isValidMessage(message)) {
		if (currentUser === null) {
			userMessage = {
				user: guestUser,
				message: message,
				date: dateTime
			}
		} else {
			userMessage = {
				user: currentUser,
				message: message,
				date: dateTime
			}
		}
		db.data.messagesPublic.push(userMessage)
		await db.write()
		res.sendStatus(200)
	} else {
		res.sendStatus(400)
	}
})

export default router
