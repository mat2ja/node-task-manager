import '../src/db/mongoose.js';
import model from '../src/models/index.js';
const { Task } = model;

const deleteTaskAndCount = async (id) => {
	const task = await Task.findByIdAndRemove(id);
	const uncompleted = await Task.countDocuments({ completed: false });
	return { task, uncompleted };
};

deleteTaskAndCount('610feb2bb0fc1d60fb5b114b')
	.then(({ task, uncompleted }) => {
		console.log('Removed:', task);
		console.log(`There are ${uncompleted} tasks yet to be completed`);
	})
	.catch((error) => console.log(error.message));
