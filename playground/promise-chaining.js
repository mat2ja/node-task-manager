import '../src/db/mongoose.js';
import model from '../src/models/index.js';
const { User } = model;

const updateAgeAndCount = async (id, age) => {
	const user = await User.findByIdAndUpdate(id, { age });
	const count = await User.countDocuments({ age });
	return { user, count };
};

updateAgeAndCount('610ea3838156b805088ae1c9', 10)
	.then((res) => {
		console.log(res);
	})
	.catch((err) => console.log(err.message));

console.log('befoore');
