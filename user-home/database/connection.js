// restdb.io query handler
var restDB = (function() {

	// configure for your own DB
	var api = 'https://pisample-250e.restdb.io/rest'
	var	APIkey = '6112d0b769fac573b50a540e';

	// query the database
	function query(url, callback) {

		var timeout, xhr = new XMLHttpRequest();

		// set URL and headers
		xhr.open('GET', api + url);
		xhr.setRequestHeader('x-apikey', APIkey);
		xhr.setRequestHeader('content-type', 'application/json');
		xhr.setRequestHeader('cache-control', 'no-cache');

		// response handler
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) return;
			var err = (xhr.status !== 200), data = null;
			clearTimeout(timeout);
			if (!err) {
				try {
					data = JSON.parse(xhr.response);
				}
				catch(e) {
					err = true;
					data = xhr.response || null;
				}
			}
			callback(err, data);
		};

		// timeout
		timeout = setTimeout(function() {
			xhr.abort();
			callback(true, null);
		}, 10000);

		// start call
		xhr.send();
	}

	// public query method
	return {
		query: query
	};

})();

let somedata = null

restDB.query(
	'/userdata?q={}',
	function(err, data) {
		// success!
		if (!err) somedata  = data;
	}
);

export somedata;