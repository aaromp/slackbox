var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/slack/media/recent?client_id=' + client_id;

var thumbnails = [];
var container, image;

var handleThumbnailClick = function(datum) {
	// console.log(datum.images.standard_resolution.url);
	image.src = datum.images.standard_resolution.url;
};

var appendThumbnails = function(json) {
	var thumbnail;
	json.data.forEach(function(datum) {
		thumbnail = document.createElement('img');
		thumbnail.classList.add('thumbnail');
		thumbnail.src = datum.images.thumbnail.url;
		thumbnail.addEventListener('click', handleThumbnailClick.bind(this, datum));
		thumbnails.push(thumbnail);
		container.appendChild(thumbnail);
	});
};

document.addEventListener('DOMContentLoaded', function() {
	container = document.createElement('div');
	image = document.createElement('img');
	document.body.appendChild(container);
	container.appendChild(image);
	container.id = 'container';
	image.id = 'image';

	var script = document.createElement('script');
	script.src = url + '&count=16' + '&callback=' + 'appendThumbnails';
	document.body.appendChild(script);
});
