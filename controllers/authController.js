const passport = require('passport');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { getTokenHeader, getTokenSignature } = require('../utils/cookieHandler');

const { APP_URL } = process.env;

const signIn = async (req, res, next) => {
	// SignIn after verify_user, if token, I should be able to signIn without creating a new token
	passport.authenticate(
		'login',
		{ session: false },
		async (err, user, info) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				const reason = (info && info.reason) || 'User not found.';
				return res.status(404).json({
					reason,
				});
			}

			try {
				const payload = { _id: user.id };
				const privateKey = fs.readFileSync('./private-key.pem', 'utf8');
				const options = {
					issuer: 'Benoit G.',
					audience: APP_URL,
					algorithm: 'RS256',
				};
				const token = jwt.sign(payload, privateKey, options);

				const cookieHeaderAndPayload = getTokenHeader();
				res.cookie(
					cookieHeaderAndPayload.name,
					cookieHeaderAndPayload.getPayload(token),
					cookieHeaderAndPayload.options
				);
				const cookieSignature = getTokenSignature();
				res.cookie(
					cookieSignature.name,
					cookieSignature.getPayload(token),
					cookieSignature.options
				);

				return res.status(200).end();
			} catch (error) {
				return next(error);
			}
		}
	)(req, res, next);
};

const signOff = (req, res) => {
	const cookieHeaderAndPayload = getTokenHeader();
	const cookieSignature = getTokenSignature();
	res.clearCookie(cookieHeaderAndPayload.name, cookieHeaderAndPayload.options);
	res.clearCookie(cookieSignature.name, cookieSignature.options);
	return res.status(200).end();
};

module.exports = {
	signIn,
	signOff,
};
