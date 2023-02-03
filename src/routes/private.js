import express from 'express'
import { isValidMessage } from '../validate.js'
import { userIsAuthorized } from '../auth.js'
import db from '../database.js'
const router = express.Router()
let date = new Date();
// get the date as a string
let n = date.toDateString();
// get the time as a string
let time = date.toLocaleTimeString();

let dateTime = n + ':' + time;

router.get('/', (req, res) => {
    console.log('get private', userIsAuthorized(req))
    if (!userIsAuthorized(req)) {
        res.sendStatus(401)
        return
    }
    res.status(200).send(db.data.messagesPrivate)
    console.log(db.data.messagesPrivate)

})

router.post('/', async (req, res) => {
    // Ta reda på om användaren är inloggad innan man får POSTa
    if (!userIsAuthorized(req)) {
        res.sendStatus(401)
        return
    }
    const message = req.body.userMessage
    const currentUser = req.body.currentUser
    if (isValidMessage(message)) {
        await db.read()
        console.log(message.length)
        const userMessage = {
            user: currentUser,
            message: message,
            date: dateTime
        }
        db.data.messagesPrivate.push(userMessage)
        await db.write()
        res.sendStatus(200)
    } else {
        res.sendStatus(400)
    }
})

export default router