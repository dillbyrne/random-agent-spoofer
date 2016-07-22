self.on('click', function (node, data) {

	//generate temporary email addresses
	if (data.slice(0, 5) === 'mail_') {

		data = setupTempEmail(data,node);

	} else {

		data = [data, null];
	}

	self.postMessage(data);
});

function getRandomStr() {

	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 9);
}

function setupTempEmail(data, node) {

	var mailbox_id = getRandomStr();
	var url = '';

	if (data === 'mail_anonbox') {

		node.value=mailbox_id + '@anonbox.net';
		url = 'https://anonbox.net/abx.html?url=' + mailbox_id;

	} else if (data === 'mail_dispostable') {

		node.value = mailbox_id + '@dispostable.com';
		url = 'http://www.dispostable.com/inbox/' + mailbox_id + '/';

	} else if (data === 'mail_yopmail') {

		node.value = mailbox_id + '@yopmail.com';
		url = 'http://www.yopmail.com/en/?' + mailbox_id;

	} else if (data === 'mail_mailcatch') {

		node.value = mailbox_id + '@mailcatch.com';
		url = 'http://www.mailcatch.com/en/temporary-inbox?box=' + mailbox_id;

	} else if (data === 'mail_mailinator') {

		node.value = mailbox_id + '@mailinator.com';
		url = 'https://www.mailinator.com/inbox2.jsp?to=' + mailbox_id;
	}

	return [data, url];
}
