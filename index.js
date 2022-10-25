const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const get = require('lodash/get');
const setWith = require('lodash/setWith');
const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);
const os = require("os")
const fs = require("fs")

// https://github.com/actions/toolkit/issues/1218
function setOutput(key, value) {
  // Temporary hack until core actions library catches up with github new recommendations
  const output = process.env['GITHUB_OUTPUT']
  fs.appendFileSync(output, `${key}=${value}${os.EOL}`)
}

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

		let rawUserOutput = {};
		fields = fields.split(',');

		fields.map((field, index) => setWith(
			rawUserOutput,
			fields[index],
			get(response.user, fields[index], 'invalid_field')
		));

		Object.entries(rawUserOutput).map((user) => {
			let outputKey = user[0];
			let outputValue = user[1];

			if (typeof user[1] !== 'object') {
				setOutput(outputKey, outputValue);
				return;
			}

			for (let nestedObjKey in user[1]) {
				outputKey = `${user[0]}_${nestedObjKey}`;
				outputValue = user[1][nestedObjKey];

				setOutput(outputKey, outputValue);
			}
		});

		core.info('Success');
		setOutput('user', rawUserOutput);
	} catch (error) {
		core.setFailed(error.message);
	}
}

getUserData();
