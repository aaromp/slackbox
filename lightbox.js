var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/slack/media/recent?client_id=' + client_id;

var thumbnails = [];
var container;

var appendThumbnails = function(json) {
	var thumbnail;
	json.data.forEach(function(datum) {
		thumbnail = document.createElement('img');
		thumbnail.src = datum.images.thumbnail.url;
		thumbnail.data = datum;
		thumbnails.push(thumbnail);
		container.appendChild(thumbnail);
	});
};

document.addEventListener('DOMContentLoaded', function() {
	container = document.createElement('div');
	document.body.appendChild(container);

	var script = document.createElement('script');
	script.src = url + '&count=16' + '&callback=' + 'appendThumbnails';
	document.body.appendChild(script);
});
