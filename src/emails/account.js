import sgMail from '@sendgrid/mail';

const fromEmail = 'matija.osrecki@gmail.com';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: fromEmail,
		subject: 'Thanks for joining in!',
		text: `Welcome to the app, ${name}! Let me know how you get along with the app.`,
	});
};

const sendCancelationEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: fromEmail,
		subject: 'Goodybe and good riddance',
		text: `Sorry to see you go, ${name}! It do be like that sometimes.`,
	});
};

export default {
	sendWelcomeEmail,
	sendCancelationEmail,
};
