const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { MyAnimeListDetail, MyAnimeListSearch, IMDBSearch, IMDBDetail } = require('./functions');

app.get('/', (req, res) => {
	res.send('Welcome to MyList API');
});

app.get('/api/imdb/search', (req, res) => {
	const { s } = req.query;

	if (s) {
		IMDBSearch(s).then((data) => {
			res.send(data);
		});
	} else {
		res.statusCode = 400;
		res.send({ code: 400, message: 'You need to use "s" parameter to search. Example: ?s=Hunter x Hunter' });
	}
});

app.get('/api/imdb/search', (req, res) => {
	const { s } = req.query;

	if (s) {
		IMDBSearch(s).then((data) => {
			res.send(data);
		});
	} else {
		res.statusCode = 400;
		res.send({ code: 400, message: 'You need to use "s" parameter to search. Example: ?s=Hunter x Hunter' });
	}
});

app.get('/api/imdb/detail/:type/:id', (req, res) => {
	const { id, type } = req.params;

	IMDBDetail(id, type).then((data) => {
		if (data.status) {
			res.send(data);
		} else {
			res.statusCode = data.statusCode;
			res.send(data);
		}
	});
});

app.get('/api/myanimelist/search', (req, res) => {
	const { s } = req.query;

	if (s) {
		MyAnimeListSearch(s).then((data) => {
			res.send(data);
		});
	} else {
		res.statusCode = 400;
		res.send({ code: 400, message: 'You need to use "s" parameter to search. Example: ?s=Hunter x Hunter' });
	}
});

app.get('/api/myanimelist/detail/:type/:id', (req, res) => {
	const { id, type } = req.params;

	MyAnimeListDetail(id, type).then((data) => {
		if (data.status) {
			res.send(data);
		} else {
			res.statusCode = data.statusCode;
			res.send(data);
		}
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
