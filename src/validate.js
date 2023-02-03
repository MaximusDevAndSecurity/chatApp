function isValidMessage(message) {
	if (!isNonEmptyString(message)) {
		console.log('Need to write something')
		return false
	}

	return true
}
function isValidPassword(password) {
	if (typeof password === 'string' && password.length >= 8) {
		return true;
	} else {
		return false;
	}
}

function isNonEmptyString(x) {
	return typeof x === 'string' && x.length > 0
}

export { isValidPassword, isValidMessage, isNonEmptyString }
