import express from 'express'
import db from '../database.js'
import { isValidMessage, isValidPassword } from '../validate.js'
import { createToken, authenticateUser, userIsAuthorized } from '../auth.js'
import bcrypt from 'bcrypt'
const router = express.Router()

router.get('/', (req, res) => {
    if (!userIsAuthorized(req)) {
        res.sendStatus(401)
        return
    } else {
        res.sendStatus(200)
    }
})

router.post('/login', (req, res) => {
    console.log('du toucha routen')
    const { name, password } = req.body

    // Finns användaren i databasen?
    if (authenticateUser(name, password)) {
        const userToken = createToken(name)
        res.status(200).send(userToken)

    } else {
        res.sendStatus(401)  // Unauthorized
        return
    }
})
export default router

router.post('/register', async (req, res) => {
    const { name, password } = req.body
    console.log(name, password)
    if (isValidMessage(name) && isValidPassword(password)) {
        const match = db.data.users.find(user => user.name === name)
        if (match) {
            res.sendStatus(400)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const user = {
                name: name,
                password: hashedPassword
            }

            await db.read()
            db.data.users.push(user)
            await db.write()
            res.sendStatus(200)
        }
    } else {
        res.sendStatus(400)
    }
})

