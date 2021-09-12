import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

const db = mongoose.connection;

db.on('error', () => console.error('connection error'));
db.once('open', async () => console.log('🐦 mongoose up and running 🐤'));
