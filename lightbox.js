var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/iceland/media/recent?client_id=' + client_id;

var thumbnails = [];
var container, image;

var handleThumbnailClick = function(data) {
	console.log(data);
	// initialize image
	image.src = '';
	image.style.top = '';
	image.style.left = '';
	image.src = data.images.standard_resolution.url;
	image.style.opacity = 0;

	image.onload = function() {
		image.style.opacity = 1; // make visible

		// set initial size and position
		image.style.transition = 'none';
		image.style.transform = 'translate(-50%, -50%) scale(' + data.images.thumbnail.width / data.images.standard_resolution.width + ')';
		image.style.top = (this.getBoundingClientRect().height/2) + this.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
		image.style.left = (this.getBoundingClientRect().width/2) + this.getBoundingClientRect().left - document.body.getBoundingClientRect().left;	
	
		// set final size and position
		image.style.transition = 'all 0.5s ease';
		image.style.transform = 'translate(-50%, -50%) scale(' + 1 + ')';
		image.style.top = (container.getBoundingClientRect().height/2) + (container.getBoundingClientRect().top) - document.body.getBoundingClientRect().top;
		image.style.left = (container.getBoundingClientRect().width/2) + (container.getBoundingClientRect().left) - document.body.getBoundingClientRect().left;
	}.bind(this);
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

	// TODO: Use an overlay
	var button = document.createElement('button');
	container.appendChild(button);
	button.style.position = 'absolute';
	button.addEventListener('click', function(e) {
		console.log('button?', e);
		image.src = '';
	});
});
