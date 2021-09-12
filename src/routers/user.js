import express from 'express';
import sharp from 'sharp';
import FileType from 'file-type';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import emailService from '../emails/account.js';
const { sendWelcomeEmail, sendCancelationEmail } = emailService;

const router = new express.Router();

// Add a new user
router.post('/users', async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(req.body.email, req.body.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send({ error });
	}
});

// Login user
router.post('/users/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

// Logout user
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(token) => token.token != req.token
		);
		await req.user.save();
		res.send('Logged out');
	} catch (error) {
		res.status(500).send();
	}
});

// Logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send('Logged out');
	} catch (error) {
		res.status(500).send();
	}
});

// Fetch profile
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

// Update a user
router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const isValidOperation = updates.every((prop) =>
		allowedUpdates.includes(prop)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates' });
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update]));
		await req.user.save();
		res.send(req.user);
	} catch (error) {
		res.status(400).send({ error });
	}
});

// Delete a user
router.delete('/users/me', auth, async (req, res) => {
	try {
		const { email, name } = req.user;
		await req.user.remove();
		sendCancelationEmail(email, name);
		return res.send('User deleted');
	} catch (error) {
		res.status(500).send({ error });
	}
});

// Upload user avatar
router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send('Avatar uploaded');
	},
	// middleware error handling/restructuring
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Delete user avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send('Avatar deleted');
});

// Fetch avatar
router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error();
		}

		const { mime } = await FileType.fromBuffer(user.avatar);

		res.set('Content-Type', mime);
		res.send(user.avatar);
	} catch (error) {
		res.status(404).send({ error: 'Avatar not found' });
	}
});

export default router;
