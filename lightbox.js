var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/selfie/media/recent?client_id=' + client_id;

var thumbnails = [];
var container, image;

var handleThumbnailClick = function(data) {
	// set image
	image.src = '';
	image.src = data.images.standard_resolution.url;

	// set image width
	image.style.width = this.getBoundingClientRect().width;
	image.style.height = this.getBoundingClientRect().height;

	// set initial position
	image.style.top = this.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
	image.style.left = this.getBoundingClientRect().left - document.body.getBoundingClientRect().left;
};

var appendThumbnails = function(json) {
	var thumbnail;
	json.data.forEach(function(data) {
		thumbnail = document.createElement('img');
		thumbnail.classList.add('thumbnail');
		thumbnail.src = data.images.thumbnail.url;
		thumbnail.addEventListener('click', handleThumbnailClick.bind(thumbnail, data));
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
