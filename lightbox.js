var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/slack/media/recent?client_id=' + client_id;

var appendThumbnails = function(json) {
	var image;
	json.data.forEach(function(datum) {
		image = document.createElement('img');
		image.src = datum.images.thumbnail.url;
		image.data = datum;
		document.body.appendChild(image);
	});
};

document.addEventListener('DOMContentLoaded', function() {
	var script = document.createElement('script');
	script.src = url + '&count=16' + '&callback=' + 'appendThumbnails';
	document.body.appendChild(script);
});
