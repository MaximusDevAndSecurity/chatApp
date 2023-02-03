const btnGetPublic = document.querySelector('#btnGetPublic')
const btnPostMessage = document.querySelector('#btnPostMessage')
const publicList = document.querySelector('#chatListPublic')
const inputUsername = document.querySelector('#inputUsername')
const inputPassword = document.querySelector('#inputPassword')
const btnLogin = document.querySelector('#btnLogin')
const btnLogout = document.querySelector('#btnLogout')
const inputPublic = document.querySelector('#inputPublic')
const regButton = document.querySelector('#regButton')
const btnGetPrivateChannel = document.querySelector('#btnGetPrivate')
const privateList = document.querySelector('#chatListPrivate')
const postPrivate = document.querySelector('#btnPostPrivate')
const inputPrivate = document.querySelector('#inputPrivate')
const publicCLassSetter = document.querySelector('#getPublic')
const privateCLassSetter = document.querySelector('#getPrivate')
const publicCLassSend = document.querySelector('#sendPublic')
const privateCLassSend = document.querySelector('#sendPrivate')
const messageBox = document.querySelectorAll('.active')
const errorContainer = document.querySelector('#errorMessages')
// Används med localStorage 
const JWT_KEY = 'userKey'
const JWT_NAME = 'Username'
let currentUser = null
let isLoggedIn = false
getCurrentUser()

function updateLoginStatus() {
	btnLogin.disabled = isLoggedIn
	btnLogout.disabled = !isLoggedIn
}
// registrera användare
regButton.addEventListener('click', async () => {
	const user = {
		name: inputUsername.value,
		password: inputPassword.value
	}
	// "Optimistisk" kod
	const options = {
		method: 'POST',
		body: JSON.stringify(user),
		headers: {
			// MIME type: application/json
			"Content-Type": "application/json"
		}
	}
	const response = await fetch('/auth/register', options)
	errorContainer.innerText = ''
	if (response.status === 200) {
		console.log('Register successful')
		inputPassword.value = ''
		inputUsername.value = ''
		errorContainer.style.color = 'green'
		errorContainer.innerHTML = 'Successful registration, please login.'
	} else if (response.status === 400) {  // status 401 unauthorized
		console.log('Register failed, try different username or password: ' + response.status)
		errorContainer.style.color = 'red'
		errorContainer.innerText = 'Register failed, try different username or password, password must be longer than 8 characters! '
	}
})
//logga in
btnLogin.addEventListener('click', async () => {
	// hämta username och password
	// skicka med POST request till servern
	// när servern svarar:
	// - updatera gränssnittet
	// - spara JWT i localStorage

	const user = {
		name: inputUsername.value,
		password: inputPassword.value
	}
	// "Optimistisk" kod
	const options = {
		method: 'POST',
		body: JSON.stringify(user),
		headers: {
			// MIME type: application/json
			"Content-Type": "application/json"
		}
	}
	const response = await fetch('/auth/login', options)
	errorContainer.innerText = ''
	if (response.status === 200) {
		console.log('Login successful')
		const userToken = await response.json()
		// Spara userToken.token
		localStorage.setItem(JWT_KEY, userToken.token)
		localStorage.setItem(JWT_NAME, userToken.name)
		isLoggedIn = true
		currentUser = userToken.name
		inputPassword.value = ''
		inputUsername.value = ''
		errorContainer.style.color = 'green'
		errorContainer.innerHTML = 'You have successfully logged in.'
	} else {  // status 401 unauthorized
		console.log('Login failed, status: ' + response.status)
		errorContainer.style.color = 'red'
		errorContainer.innerText = 'Access Denied: Try different username or password!'
	}
	updateLoginStatus()
})
//log out
btnLogout.addEventListener('click', () => {
	console.log('du har loggat ut')
	localStorage.removeItem(JWT_KEY)
	localStorage.removeItem(JWT_NAME)
	currentUser = null
	isLoggedIn = false
	updateLoginStatus()
	location.reload()
})

//Hämta public channel innehåll 
async function getPublic() {
	let messages = null
	errorContainer.innerText = ''
	try {
		const response = await fetch('/messages/public')

		if (response.status !== 200) {
			console.log('Could not contact server. Status: ' + response.status)
			return
		}

		messages = await response.json()

	} catch (error) {
		console.log('Something went wrong when fetching data from server. (GET) \n', error.messages)
		return
	}
	privateCLassSend.classList.remove('active')
	privateCLassSetter.classList.remove('activeSend')
	privateCLassSend.classList.add('notActive')
	privateCLassSetter.classList.add('notActive')
	publicCLassSend.classList.remove('notActive')
	publicCLassSetter.classList.remove('notActive')
	publicCLassSetter.classList.add('active')
	publicCLassSend.classList.add('activeSend')
	btnGetPrivateChannel.style.backgroundColor = ''
	btnGetPublic.style.backgroundColor = 'green'
	publicList.innerHTML = ''
	for (let i = 0; i < messages.length; i++) {
		console.log('test', messages[i].message)
		let li = document.createElement('li')
		li.innerText = `${messages[i].user} said: ${messages[i].message} | at: (${messages[i].date})`
		publicList.appendChild(li)
		publicCLassSetter.scrollTop = publicCLassSetter.scrollHeight - publicCLassSetter.clientHeight
	}
}
btnGetPublic.addEventListener('click', getPublic)

//Send message in public channel
btnPostMessage.addEventListener('click', async () => {
	// 0. skicka med JWT om vi är inloggade
	// 1. skicka ett POST /api/books request med data i request body
	// 2. Vad skickar servern för svar?
	// 3. uppdatera gränssnittet
	let userMessage = inputPublic.value

	const options = {
		method: 'POST',
		body: JSON.stringify({ currentUser, userMessage }),
		headers: {
			"Content-Type": "application/json",
		}
	}
	const response = await fetch('/messages', options)
	errorContainer.innerText = ''
	if (response.status === 200) {
		getPublic()
		inputPublic.value = ''
	} else {
		// Något gick fel
		console.log('Något gick fel vid POST request! status=', response.status)
		errorContainer.style.color = 'red'
		errorContainer.innerText = 'Need to write something to send messages!'
	}
})

//hämta private channel innehåll
async function getPrivate() {

	let messages = null
	const jwt = localStorage.getItem(JWT_KEY)
	const options = {
		method: 'GET',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + jwt
		}
	}
	errorContainer.innerText = ''
	try {
		const response = await fetch('/privateMessages', options)

		if (response.status !== 200) {
			console.log('Could not contact server. Status: ' + response.status)
			errorContainer.style.color = 'red'
			errorContainer.innerText = 'Access Denied: Are you logged in?'
			return
		}

		messages = await response.json()

	} catch (error) {
		console.log('Something went wrong when fetching data from server. (GET) \n', error.messages)
		return
	}
	publicCLassSend.classList.remove('active')
	publicCLassSetter.classList.remove('activeSend')
	publicCLassSend.classList.add('notActive')
	publicCLassSetter.classList.add('notActive')
	privateCLassSend.classList.remove('notActive')
	privateCLassSetter.classList.remove('notActive')
	privateCLassSetter.classList.add('active')
	privateCLassSend.classList.add('activeSend')
	btnGetPrivateChannel.style.backgroundColor = 'green'
	btnGetPublic.style.backgroundColor = ''
	privateList.innerHTML = ''
	for (let i = 0; i < messages.length; i++) {
		console.log('test', messages[i].message)
		let li = document.createElement('li')
		console.log('getPrivate', messages[i])
		li.innerText = `${messages[i].user} sent: ${messages[i].message} | at: (${messages[i].date})`
		privateList.appendChild(li)
		privateCLassSetter.scrollTop = privateCLassSetter.scrollHeight - privateCLassSetter.clientHeight
	}
}
btnGetPrivateChannel.addEventListener('click', getPrivate)

//send messages in private channel
postPrivate.addEventListener('click', async () => {

	let userMessage = inputPrivate.value

	const jwt = localStorage.getItem(JWT_KEY)
	const options = {
		method: 'POST',
		body: JSON.stringify({ currentUser, userMessage }),
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + jwt
		}
	}
	const response = await fetch('/privateMessages', options)
	errorContainer.innerText = ''
	if (response.status === 200) {
		getPrivate()
		inputPrivate.value = ''
	} else {
		// Något gick fel
		console.log('Något gick fel vid POST request! status=', response.status)
		errorContainer.innerText = 'Need to write something to send messages!'
	}
})

//Har personen loggat in function?
async function getCurrentUser() {
	const jwt = localStorage.getItem(JWT_KEY)
	const options = {
		method: 'GET',
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + jwt
		}
	}
	const response = await fetch('/auth', options)
	if (response.status === 200) {
		currentUser = localStorage.getItem(JWT_NAME)
		isLoggedIn = true
		updateLoginStatus()
	} else {
		return
	}
}
