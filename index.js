const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const get = require('lodash/get');
const setWith = require('lodash/setWith');
const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

async function getUserData() {
	try {
		const email = core.getInput('email') || '';

		if (email.length <= 0) {
			throw new Error('The email value is required to run this action.');
		}

		const response = await web.users.lookupByEmail({ email });

		if (!response.ok) {
			throw new Error('The Slack API thrown an error.');
		}

		let fields = core.getInput('fields') || '';

		if (fields.length <= 0) {
			throw new Error('The fields value is required to run this action.');
		}

		let userOutput = {};

		fields.split(',');

		fields.map((field, index) => setWith(
			userOutput,
			fields[index],
			get(response.user, fields[index], 'invalid_field')
		));

		core.info('Success');
		core.setOutput('user', userOutput);
	} catch (error) {
		core.setFailed(error.message);
	}
}

getUserData();
