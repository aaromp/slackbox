var client_id = '38615c1e89344d13b07e194a36915fc8';
var root = 'https://api.instagram.com/v1/tags/nyc/media/recent?client_id=' + client_id;

var script, container, overlays, background, image, button;

// initialize global variables;
var pagination;
var data = [];
var thumbnails = [];
var index = 0;
var updated = new Event('updated');
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

var handleThumbnailClick = function(data, position) {
	index = position;
	background.classList.add('active');
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
		setStyles(image, states.initial);
	
		// set final size and position
		setState(states.final, container, 1);
		image.style.transition = 'all 0.5s ease';
		setStyles(image, states.final);

		image.onload = null; // remove onload function
	}.bind(this);
};

var addThumbnails = function(thumbnails, number) {
	var thumbnail;
	return Array.apply(null, Array(number)).reduce(function(thumbnails) {
		thumbnail = document.createElement('img');
		thumbnail.classList.add('thumbnail');
		container.insertBefore(thumbnail, button);
		thumbnails.push(thumbnail);
		return thumbnails;
	}, thumbnails);
};

var setThumbnails = function(thumbnails, data, offset) {
	console.log(thumbnails.length, data.length);
	var position;
	data.forEach(function(data, index) {
		position = offset + index;
		thumbnails[position].src = data.images.thumbnail.url;
		thumbnails[position].addEventListener('click', handleThumbnailClick.bind(thumbnails[position], data, position));
	});
};

var createOverlay = function(position) {
	var overlay = document.createElement('div');
	overlay.id = position;
	overlays.appendChild(overlay);
	return overlay;
};

var handleOverlayClick = function(event) {
	if (event.target.id === 'right') index++;
	else if (event.target.id === 'left') index--;

	index = (data.length + index) % data.length;
	console.log(data.length, index);
	image.dispatchEvent(updated);
};

var paginateForward = function(json) {
	console.log('forward!');
	pagination = json.pagination;
	data = json.data.concat(Array.apply(null, Array(24))).slice(0, 24);
	setThumbnails(data);
};

var paginateBackward = function(json) {
	console.log('backward!');
	pagination = json.pagination;
	data = json.data.concat(data).slice(0, 24);
	setThumbnails(data);
};

var getData = function(url) {
	document.body.removeChild(script);
	script = document.createElement('script');
	script.src = url;
	document.body.appendChild(script);
};

var getURL = function(count, callback, param, value) {
	var url = [root, '&count=', count, '&callback=', callback].join('');
	if (param) url += ['&', param, '=', value].join('');
	return url;
};

var initialize = function(json) {
	var offset = thumbnails.length;
	addThumbnails(thumbnails, 24);
	data = json.data;
	pagination = json.pagination;
	setThumbnails(thumbnails, data, offset);
};

var handleData = function(json) {
	var offset = thumbnails.length;
	addThumbnails(thumbnails, json.data.length);
	setThumbnails(thumbnails, json.data, offset);
	data = data.concat(json.data);
	pagination = json.pagination;
};

document.addEventListener('DOMContentLoaded', function() {
	// create elements
	script = document.createElement('script');
	container = document.createElement('div');
	overlays = document.createElement('div');
	background = document.createElement('div');
	image = document.createElement('img');
	button = document.createElement('div');

	// add ids
	container.id = 'container';
	overlays.id = 'overlays';
	background.id = 'background';
	image.id = 'image';
	button.id = 'button';
	
	// append elements to DOM
	document.body.appendChild(container);
	document.body.appendChild(script);
	background.appendChild(overlays);
	container.appendChild(background);
	container.appendChild(button);
	container.appendChild(image);

	createOverlay('left').addEventListener('click', handleOverlayClick);
	createOverlay('right').addEventListener('click', handleOverlayClick);

	// add event listeners
	image.addEventListener('updated', function() {
		image.style.transition = 'none'; // turn off transition
		setState(states.initial, thumbnails[index], data[index].images.thumbnail.width/data[index].images.standard_resolution.width);
		image.src = data[index].images.standard_resolution.url;
	});

	button.addEventListener('click', function(event) {
		console.log('butotn was clicked');
		var url = getURL(25, 'handleData', 'max_tag_id', pagination.next_max_tag_id);
		getData(url);
	});

	overlays.addEventListener('click', function(event) {
		event.stopPropagation();
	});

	background.addEventListener('click', function(event) {
		image.style.transition = 'all 0.5s ease'; // turn transition back on
		background.classList.remove('active');
		
		setStyles(image, states.initial);

		// remove image after transitioned to grid mode
		image.addEventListener('transitionend', function removeImage() {
			console.log('transitionend');
			image.src = '';
			image.removeEventListener('transitionend', removeImage);
		});
	});

	// add data
	getData(getURL(24, 'handleData'));
});
