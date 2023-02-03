// Imports
import express from 'express'
import * as url from 'url';
import publicRoute from './routes/public.js'
import authRoute from './routes/authRoute.js'
import privateRoute from './routes/private.js'


// Konfiguration
const app = express()
// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const staticPath = url.fileURLToPath(new URL('../static', import.meta.url))



// Middleware
const logger = (req, res, next) => {
	console.log(`${req.method}  ${req.url}`, req.body)
	next()
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger)
app.use(express.static(staticPath))

//routes
app.use('/privateMessages', privateRoute)
app.use('/messages', publicRoute)
app.use('/auth', authRoute)

export { app }
