var client_id = '38615c1e89344d13b07e194a36915fc8';
var root = 'https://api.instagram.com/v1/tags/nyc/media/recent?client_id=' + client_id;

var data;
var thumbnails;
var script, container, overlays, background, image, button;
var index = 0;
var updated = new Event('updated');
var states = {
	initial: {},
	final: {}
};

var current;

var pagination;

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

var handleThumbnailClick = function(data, i) {
	index = i;
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

var createThumbnails = function(number) {
	var thumbnail;
	return Array.apply(null, Array(number)).map(function() {
		thumbnail = document.createElement('img');
		thumbnail.index = index;
		thumbnail.classList.add('thumbnail');
		// container.appendChild(thumbnail);
		container.insertBefore(thumbnail, button);
		return thumbnail;
	});
};

var initialize = function(json) {
	data = json.data;
	pagination = json.pagination;
	setThumbnails();
};

var setThumbnails = function() {
	data.forEach(function(data, index) {
		thumbnails[index].src = data.images.thumbnail.url;
		thumbnails[index].addEventListener('click', handleThumbnailClick.bind(thumbnails[index], data, index));
	});
};

var createOverlay = function(position) {
	var overlay = document.createElement('div');
	overlay.id = position;
	overlays.appendChild(overlay);
	return overlay;
};

var handleOverlayClick = function(event) {
	// var url;
	// console.log(current);
	// if (event.target.id === 'right') {
	// 	// url = pagination.next_url;
	// 	// url = getURL('paginateForward', 'max_tag_id', pagination.next_max_tag_id);
	// 	url = getURL('paginateForward', 'min_tag_id', pagination.min_tag_id);
	// 	urls.push(url);
	// 	getData(url);
	// } else if (event.target.id === 'left')  {
	// 	url = urls.pop(); // get current
	// 	if (url === current) url = urls.pop(); // if we're already on that page, go to previous
	// 	if (url === undefined) url = getURL('paginateBackward', 'min_tag_id', pagination.min_tag_id);
	// 	getData(url);
	// }
	// current = url;
	// console.log(urls.length);

	if (event.target.id === 'right') index++;
	else if (event.target.id === 'left') index--;

	index = (data.length + index) % data.length;
	image.dispatchEvent(updated);
};

var paginateForward = function(json) {
	console.log('forward!');
	pagination = json.pagination;
	data = json.data.concat(Array.apply(null, Array(24))).slice(0, 24);
	setThumbnails();
};

var paginateBackward = function(json) {
	console.log('backward!');
	pagination = json.pagination;
	data = json.data.concat(data).slice(0, 24);
	setThumbnails();
};

var getData = function(url) {
	document.body.removeChild(script);
	script = document.createElement('script');
	script.src = url;
	document.body.appendChild(script);
};

var getURL = function(callback, param, value) {
	var url = root + '&count=24' + '&callback=' + callback;
	if (param) url += ['&', param, '=', value].join('');
	return url;
};

document.addEventListener('DOMContentLoaded', function() {
	script = document.createElement('script');
	document.body.appendChild(script);
	container = document.createElement('div');
	overlays = document.createElement('div');
	background = document.createElement('div');
	image = document.createElement('img');
	button = document.createElement('div');
	button.id = 'button';
	overlays.id = 'overlays';
	document.body.appendChild(container);
	background.appendChild(overlays);
	container.appendChild(background);
	container.appendChild(button);
	container.appendChild(image);
	container.id = 'container';
	image.id = 'image';
	background.id = 'background';

	thumbnails = createThumbnails(24);
	getData(getURL('initialize'));

	createOverlay('left').addEventListener('click', handleOverlayClick);
	createOverlay('right').addEventListener('click', handleOverlayClick);

	image.addEventListener('updated', function() {
		image.style.transition = 'none'; // turn off transition
		setState(states.initial, thumbnails[index], data[index].images.thumbnail.width/data[index].images.standard_resolution.width);
		image.src = data[index].images.standard_resolution.url;
	});

	overlays.addEventListener('click', function(event) {
		event.stopPropagation();
	});

	// TODO: Use an overlay
	// button.style.position = 'absolute';
	background.addEventListener('click', function(event) {
		image.style.transition = 'all 0.5s ease'; // turn transition back on
		background.classList.remove('active');
		
		setStyles(image, states.initial);

		// // TODO: decide if necessary;
		// image.addEventListener('transitionend', function removeImage() {
		// 	console.log('transitionend');
		// 	image.src = '';
		// 	image.removeEventListener('transitionend', removeImage);
		// });
	});
});
