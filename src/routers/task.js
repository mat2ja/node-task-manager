import express from 'express';
import Task from '../models/task.js';
import auth from '../middleware/auth.js';

const router = new express.Router();

// Add a new task
router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch (error) {
		res.status(418).send({ error });
	}
});

// Fetch all tasks
//? /tasks?completed=true&limit=2&skip=2&sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	if (req.query.sortBy) {
		const [field, order] = req.query.sortBy.split(':');
		sort[field] = order === 'desc' ? -1 : 1;
	}

	try {
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate();
		res.send(req.user.tasks);
	} catch (error) {
		res.status(400).send();
	}
});

// Fetch a task by id
router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({ _id, owner: req.user._id });
		if (!task) {
			return res.status(404).send({ error: 'Task not found' });
		}
		res.status(202).send(task);
	} catch (error) {
		res.status(400).send({ error: 'Error fetching task' });
	}
});

// Update a task
router.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'completed'];
	const isValidOperation = updates.every((prop) =>
		allowedUpdates.includes(prop)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates' });
	}

	try {
		const task = await Task.findOneAndUpdate(
			{ _id: req.params.id, owner: req.user._id },
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);
		if (!task) {
			return res.status(404).send({ error: 'Task not found' });
		}
		return res.send(task);
	} catch (error) {
		res.status(404).send({ error });
	}
});

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!task) {
			return res.status(404).send({ error: 'Task not found' });
		}
		return res.send(task);
	} catch (error) {
		res.status(500).send({ error });
	}
});

export default router;
