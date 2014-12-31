var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/tags/iceland/media/recent?client_id=' + client_id;

var data;
var thumbnails = [];
var container, overlays, image, index;
var states = {
	initial: {},
	final: {}
};


var setState = function(state, container, scale) {
	state.transform = 'translate(-50%, -50%) scale(' + scale + ')';
	state.top = (container.getBoundingClientRect().height/2) + container.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
	state.left = (container.getBoundingClientRect().width/2) + container.getBoundingClientRect().left - document.body.getBoundingClientRect().left;	
};

var setStyles = function(element, styles) {
	Object.keys(styles).forEach(function(style) {
		element.style[style] = styles[style];
	});
};

var handleThumbnailClick = function(data) {
	console.log('thumbnail click');
	index = this.index;
	overlays.classList.add('active');
	// initialize image
	image.src = '';
	image.style.top = '';
	image.style.left = '';
	image.src = data.images.standard_resolution.url;
	image.style.opacity = 0;

	image.onload = function() {
		image.style.opacity = 1; // make visible

		// set initial size and position
		setState(states.initial, this, data.images.thumbnail.width/data.images.standard_resolution.width);
		image.style.transition = 'none';
		console.log(window.getComputedStyle(image).transition);
		setStyles(image, states.initial);
	
		// set final size and position
		setState(states.final, container, 1);
		image.style.transition = 'all 0.5s ease';
		setStyles(image, states.final);

		image.onload = null; // remove onload function
	}.bind(this);
};

var appendThumbnails = function(json) {
	var thumbnail;
	data = json.data;
	json.data.forEach(function(data, index) {
		thumbnail = document.createElement('img');
		thumbnail.index = index;
		thumbnail.classList.add('thumbnail');
		thumbnail.src = data.images.thumbnail.url;
		thumbnail.addEventListener('click', handleThumbnailClick.bind(thumbnail, data));
		thumbnails.push(thumbnail);
		container.appendChild(thumbnail);
	});
};

var createOverlay = function(position) {
	var overlay = document.createElement('div');
	overlay.id = position;
	overlays.appendChild(overlay);
	return overlay;
};

var handleOverlayClick = function(event) {
	console.log(event.target.id, 'click');
	if (event.target.id === 'right') index++;
	image.style.transition = 'none';
	setState(states.initial, thumbnails[index], data[index].images.thumbnail.width/data[index].images.standard_resolution.width);
	image.src = data[index].images.standard_resolution.url;
};

document.addEventListener('DOMContentLoaded', function() {
	container = document.createElement('div');
	overlays = document.createElement('div');
	image = document.createElement('img');
	overlays.id = 'overlays';
	document.body.appendChild(container);
	container.appendChild(overlays);
	container.appendChild(image);
	container.id = 'container';
	image.id = 'image';

	createOverlay('left').addEventListener('click', handleOverlayClick);
	createOverlay('right').addEventListener('click', handleOverlayClick);

	var script = document.createElement('script');
	script.src = url + '&count=16' + '&callback=' + 'appendThumbnails';
	document.body.appendChild(script);

	// TODO: Use an overlay
	var button = document.createElement('button');
	container.appendChild(button);
	button.style.position = 'absolute';
	button.addEventListener('click', function(e) {
		console.log('button click');
		console.log(states, e);
		image.style.transition = 'all 0.5s ease';
		overlays.classList.remove('active');
		
		setStyles(image, states.initial);

		// // TODO: decide if necessary;
		// image.addEventListener('transitionend', function removeImage() {
		// 	console.log('transitionend');
		// 	image.src = '';
		// 	image.removeEventListener('transitionend', removeImage);
		// });
	});
});
