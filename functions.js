const puppeteer = require('puppeteer');
const puppeteer_config = {
	headless: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

async function MyAnimeListDetail(id, type) {
	if (type != 'anime' && type != 'manga') {
		// Diğer tipleri de yapmak lazım
		return {
			status: false,
			statusCode: 404,
			message: 'Content not found.',
		};
	}

	const browser = await puppeteer.launch(puppeteer_config);
	const page = await browser.newPage();

	// Kaç kişi tarafından oylandı, anime özeti yazıları, karakterler, aktörler, staff
	const page_response = await page.goto(`https://myanimelist.net/${type}/${id}`, { waitUntil: 'networkidle2' });
	let statusCode = page_response.status();

	if (statusCode === 404) {
		return {
			status: false,
			statusCode: 404,
			message: 'Content not found.',
		};
	}

	const return_data = await page.evaluate(
		(id, type) => {
			let url = document.URL;
			let title, synopsis;
			if (type == 'anime') {
				synopsis = document.querySelector('.js-scrollfix-bottom-rel table p').innerText;
				title = document.querySelector('.title-name').innerText;
			} else if (type == 'manga') {
				synopsis = document.querySelector('.pb24').nextSibling.nextSibling.innerText;
				title = document.querySelector('span.h1-title').innerText;
				title = title.split('\n');
				title = title[0];
			}
			let characters_url = document.querySelector('.anime_detail_related_anime').nextSibling.nextSibling;
			characters_url = characters_url.querySelector('.floatRightHeader a').href;
			let score = document.querySelector('.score-label').innerText;
			let image = document.querySelector('td.borderClass div div:nth-child(1) a img').src;
			let content_type,
				episodes,
				volumes,
				chapters,
				aired,
				status,
				producers,
				studios,
				authors,
				serialization,
				licensors,
				genres,
				source,
				duration,
				rating,
				english_title,
				japanese_title;

			let info = document.querySelector('td.borderClass div').innerText;
			info_arr = info.split('\n');

			info_arr.forEach((line) => {
				if (line.includes('Type:')) content_type = line.slice(line.indexOf('Type: ') + 'Type: '.length);
				else if (line.includes('Episodes:')) episodes = line.slice(line.indexOf('Episodes: ') + 'Episodes: '.length);
				else if (line.includes('Volumes:')) volumes = line.slice(line.indexOf('Volumes: ') + 'Volumes: '.length);
				else if (line.includes('Chapters:')) chapters = line.slice(line.indexOf('Chapters: ') + 'Chapters: '.length);
				else if (line.includes('Status:')) status = line.slice(line.indexOf('Status: ') + 'Status: '.length);
				else if (line.includes('Producers:')) producers = line.slice(line.indexOf('Producers: ') + 'Producers: '.length);
				else if (line.includes('Studios:')) studios = line.slice(line.indexOf('Studios: ') + 'Studios: '.length);
				else if (line.includes('Authors:')) authors = line.slice(line.indexOf('Authors: ') + 'Authors: '.length);
				else if (line.includes('Serialization:'))
					serialization = line.slice(line.indexOf('Serialization: ') + 'Serialization: '.length);
				else if (line.includes('Licensors:')) licensors = line.slice(line.indexOf('Licensors: ') + 'Licensors: '.length);
				else if (line.includes('Genres:')) genres = line.slice(line.indexOf('Genres: ') + 'Genres: '.length);
				else if (line.includes('Source:')) source = line.slice(line.indexOf('Source: ') + 'Source: '.length);
				else if (line.includes('Duration:')) duration = line.slice(line.indexOf('Duration: ') + 'Duration: '.length);
				else if (line.includes('Rating:')) rating = line.slice(line.indexOf('Rating: ') + 'Rating: '.length);
				else if (line.includes('English:')) english_title = line.slice(line.indexOf('English: ') + 'English: '.length);
				else if (line.includes('Japanese:')) japanese_title = line.slice(line.indexOf('Japanese: ') + 'Japanese: '.length);
			});

			return {
				status: true,
				response: {
					id,
					url,
					image,
					title,
					english_title,
					japanese_title,
					synopsis,
					score,
					type: content_type,
					episodes,
					volumes,
					chapters,
					aired,
					status,
					studios,
					authors,
					serialization,
					licensors,
					producers,
					genres,
					source,
					duration,
					rating,
					characters_url,
				},
			};
		},
		id,
		type
	);

	await page.goto(return_data.response.characters_url, { waitUntil: 'networkidle2' });

	const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
	const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
	page.setViewport({ width: bodyWidth, height: bodyHeight });

	const character_list = await page.evaluate((type) => {
		let characters = document.querySelector('.js-scrollfix-bottom-rel');
		characters = characters.querySelectorAll(':scope > table');
		let character_list = [];

		characters.forEach((item) => {
			item = item.querySelectorAll('tr td.borderClass');
			let image = item[0].querySelector('.picSurround a img').getAttribute('data-src');
			let name = item[1].querySelector('a').innerText;
			let type = item[1].querySelector('div small').innerText;

			character_list.push({ image, name, type });
		});

		return character_list;
	}, type);

	return_data.response.characters = character_list;

	await browser.close();
	return return_data;
}

async function MyAnimeListSearch(search_text) {
	const browser = await puppeteer.launch(puppeteer_config);
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', (request) => {
		if (request.resourceType() === 'image') request.abort();
		else request.continue();
	});
	await page.goto(`https://myanimelist.net/search/all?q=${search_text}&cat=all`, { waitUntil: 'networkidle2' });

	const return_data = await page.evaluate(() => {
		const anime_data = document.querySelector('#anime').nextElementSibling;
		const manga_data = document.querySelector('#manga').nextElementSibling;

		const anime_results = anime_data.querySelectorAll('.list');
		const manga_results = manga_data.querySelectorAll('.list');

		const anime_list = [];
		const manga_list = [];

		anime_results.forEach((data) => {
			let source = 'myanimelist';
			let image = data.querySelector('.picSurround a img').src;
			let title = data.querySelector('.information a:nth-child(1)').innerText;
			let url = data.querySelector('.information a:nth-child(1)').href;
			let type = data.querySelector('.information div a').innerText;
			let id = url.slice(url.indexOf('anime/') + 6);
			id = id.slice(0, id.indexOf('/'));

			let additional = data.querySelector('.information div').innerText;
			additional = additional.replace(/\s/g, '');

			let episodes = '1';
			let score = additional.substr(additional.indexOf('Scored') + 6, 4);
			if (additional.indexOf('(') != -1) {
				episodes = additional.slice(additional.indexOf('(') + 1, additional.indexOf('eps)'));
			}

			anime_list.push({ id, url, image, title, type, source, episodes, score });
		});

		manga_results.forEach((data) => {
			let source = 'myanimelist';
			let image = data.querySelector('.picSurround a').innerHTML;
			image = image.slice(image.indexOf('src="') + 5);
			image = image.slice(0, image.indexOf('"'));
			let title = data.querySelector('.information a:nth-child(1)').innerText;
			let url = data.querySelector('.information a:nth-child(1)').href;
			let id = url.slice(url.indexOf('manga/') + 6);
			id = id.slice(0, id.indexOf('/'));

			let additional = data.querySelector('.information div').innerText;
			additional = additional.replace(/\s/g, '');

			let volumes = null;
			let type = additional.slice(0, additional.indexOf('Scored'));
			let score = additional.substr(additional.indexOf('Scored') + 6, 4);
			if (type.indexOf('(') != -1) {
				volumes = additional.slice(type.indexOf('(') + 1, type.indexOf('vols)'));
				type = type.slice(0, type.indexOf('('));
				if (type == 'LightNovel') type = 'Light Novel';
			}

			manga_list.push({ id, url, image, title, type, source, volumes, score });
		});

		return {
			status: true,
			response: { anime: anime_list, manga: manga_list },
		};
	});

	await browser.close();
	return return_data;
}

async function IMDBSearch(search_text) {
	const browser = await puppeteer.launch(puppeteer_config);
	const page = await browser.newPage();
	await page.goto(`https://www.imdb.com/search/title/?title=${search_text}`, { waitUntil: 'networkidle2' });

	const return_data = await page.evaluate(() => {
		const title_data = document.querySelectorAll('.lister-list .lister-item');
		const title_list = [];

		title_data.forEach((data) => {
			let source = 'imdb';
			let image = data.querySelector('.lister-item-image a img').src;
			let title = data.querySelector('.lister-item-content h3 a').innerText;
			let url = data.querySelector('.lister-item-content h3 a').href;
			/*let type = data
				.querySelector('.result_text')
				.innerText.slice(str.indexOf(')') + 3)
				.slice(0, -1);
            */
			let id = url.slice(url.indexOf('title/') + 6);
			id = id.slice(0, id.indexOf('/'));

			let score = data.querySelector('.ratings-bar div strong');
			score = score ? score.innerText : null;

			title_list.push({ id, url, image, title, source, score });
		});

		return {
			status: true,
			response: title_list,
		};
	});

	await browser.close();
	return return_data;
}

async function IMDBDetail(id, type) {
	if (type != 'title') {
		// Diğer tipleri de yapmak lazım
		return {
			status: false,
			statusCode: 404,
			message: 'Content not found.',
		};
	}

	const browser = await puppeteer.launch(puppeteer_config);
	const page = await browser.newPage();
	const page_response = await page.goto(`https://www.imdb.com/${type}/${id}`, { waitUntil: 'networkidle2' });
	let statusCode = page_response.status();

	if (statusCode === 404) {
		return {
			status: false,
			statusCode: 404,
			message: 'Content not found.',
		};
	}

	const return_data = await page.evaluate(
		(id, type) => {
			let url = document.URL;
			let title, synopsis;
			if (type == 'anime') {
				synopsis = document.querySelector('.js-scrollfix-bottom-rel table p').innerText;
				title = document.querySelector('.title-name').innerText;
			} else if (type == 'manga') {
				synopsis = document.querySelector('.pb24').nextSibling.nextSibling.innerText;
				title = document.querySelector('span.h1-title').innerText;
				title = title.split('\n');
				title = title[0];
			}
			let characters_url = document.querySelector('.anime_detail_related_anime').nextSibling.nextSibling;
			characters_url = characters_url.querySelector('.floatRightHeader a').href;
			let score = document.querySelector('.score-label').innerText;
			let image = document.querySelector('td.borderClass div div:nth-child(1) a img').src;
			let content_type,
				episodes,
				volumes,
				chapters,
				aired,
				status,
				producers,
				studios,
				authors,
				serialization,
				licensors,
				genres,
				source,
				duration,
				rating,
				english_title,
				japanese_title;

			let info = document.querySelector('td.borderClass div').innerText;
			info_arr = info.split('\n');

			info_arr.forEach((line) => {
				if (line.includes('Type:')) content_type = line.slice(line.indexOf('Type: ') + 'Type: '.length);
				else if (line.includes('Episodes:')) episodes = line.slice(line.indexOf('Episodes: ') + 'Episodes: '.length);
				else if (line.includes('Volumes:')) volumes = line.slice(line.indexOf('Volumes: ') + 'Volumes: '.length);
				else if (line.includes('Chapters:')) chapters = line.slice(line.indexOf('Chapters: ') + 'Chapters: '.length);
				else if (line.includes('Status:')) status = line.slice(line.indexOf('Status: ') + 'Status: '.length);
				else if (line.includes('Producers:')) producers = line.slice(line.indexOf('Producers: ') + 'Producers: '.length);
				else if (line.includes('Studios:')) studios = line.slice(line.indexOf('Studios: ') + 'Studios: '.length);
				else if (line.includes('Authors:')) authors = line.slice(line.indexOf('Authors: ') + 'Authors: '.length);
				else if (line.includes('Serialization:'))
					serialization = line.slice(line.indexOf('Serialization: ') + 'Serialization: '.length);
				else if (line.includes('Licensors:')) licensors = line.slice(line.indexOf('Licensors: ') + 'Licensors: '.length);
				else if (line.includes('Genres:')) genres = line.slice(line.indexOf('Genres: ') + 'Genres: '.length);
				else if (line.includes('Source:')) source = line.slice(line.indexOf('Source: ') + 'Source: '.length);
				else if (line.includes('Duration:')) duration = line.slice(line.indexOf('Duration: ') + 'Duration: '.length);
				else if (line.includes('Rating:')) rating = line.slice(line.indexOf('Rating: ') + 'Rating: '.length);
				else if (line.includes('English:')) english_title = line.slice(line.indexOf('English: ') + 'English: '.length);
				else if (line.includes('Japanese:')) japanese_title = line.slice(line.indexOf('Japanese: ') + 'Japanese: '.length);
			});

			return {
				status: true,
				response: {
					id,
					url,
					image,
					title,
					english_title,
					japanese_title,
					synopsis,
					score,
					type: content_type,
					episodes,
					volumes,
					chapters,
					aired,
					status,
					studios,
					authors,
					serialization,
					licensors,
					producers,
					genres,
					source,
					duration,
					rating,
					characters_url,
				},
			};
		},
		id,
		type
	);

	await page.goto(return_data.response.characters_url, { waitUntil: 'networkidle2' });

	const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
	const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
	page.setViewport({ width: bodyWidth, height: bodyHeight });

	const character_list = await page.evaluate((type) => {
		let characters = document.querySelector('.js-scrollfix-bottom-rel');
		characters = characters.querySelectorAll(':scope > table');
		let character_list = [];

		characters.forEach((item) => {
			item = item.querySelectorAll('tr td.borderClass');
			let image = item[0].querySelector('.picSurround a img').getAttribute('data-src');
			let name = item[1].querySelector('a').innerText;
			let type = item[1].querySelector('div small').innerText;

			character_list.push({ image, name, type });
		});

		return character_list;
	}, type);

	return_data.response.characters = character_list;

	await browser.close();
	return return_data;
}

exports.MyAnimeListDetail = MyAnimeListDetail;
exports.MyAnimeListSearch = MyAnimeListSearch;
exports.IMDBSearch = IMDBSearch;
