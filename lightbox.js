var client_id = '38615c1e89344d13b07e194a36915fc8';
var root = 'https://api.instagram.com/v1/tags/selfie/media/recent?client_id=' + client_id;

var Lightbox = function() {
	this.data = [];
	this.pagination = {};
	this.thumbnails = [];
	this.index = 0;
	this.states = {
		initial: {},
		final: {}
	};
	this.updated = new Event('updated');

	createElements.call(this);	
	addIDs.call(this);
	appendElements.call(this);	
	addEventListeners.call(this);

	// initialize with data
	window.handleData = handleData.bind(this); // must bind global callback to correct context
	getData.call(this, getURL(24, 'handleData'));

	return this.container;
};

Lightbox.options = {
	rows: 5,
	columns: 5,
	size: 750
};

var addEventListeners = function() {
	this.overlays.addEventListener('click', function(event) {
		event.stopPropagation();
	});

	this.left.addEventListener('click', handleOverlayClick.bind(this));
	this.right.addEventListener('click', handleOverlayClick.bind(this));

	this.background.addEventListener('click', function(event) {
		this.image.style.transition = 'all 0.5s ease'; // turn transition back on
		this.background.classList.remove('active');
		
		setStyles(this.image, this.states.initial);

		// remove image after transitioned to grid mode
		removeImage = removeImage.bind(this); // must bind remove image to correct context
		this.image.addEventListener('transitionend', removeImage);
	}.bind(this));

	this.image.addEventListener('updated', function() {
		this.image.style.transition = 'none'; // turn off transition
		setState(this.states.initial, this.thumbnails[this.index], this.data[this.index].images.thumbnail.width/this.data[this.index].images.standard_resolution.width);
		this.image.src = this.data[this.index].images.standard_resolution.url;
	}.bind(this));

	this.button.addEventListener('click', function(event) {
		var url = getURL(25, 'handleData', 'max_tag_id', this.pagination.next_max_tag_id);
		getData.call(this, url);
	}.bind(this));
};

var removeImage = function() {
	this.image.src = '';
	this.image.removeEventListener('transitionend', removeImage);
};

var appendElements = function() {
	document.body.appendChild(this.script);
	this.overlays.appendChild(this.left);
	this.overlays.appendChild(this.right);
	this.background.appendChild(this.overlays);
	this.container.appendChild(this.background);
	this.container.appendChild(this.button);
	this.container.appendChild(this.image);
};

var createElements = function() {
	this.script = document.createElement('script');
	this.container = document.createElement('div');
	this.overlays = document.createElement('div');
	this.left = document.createElement('div');
	this.right = document.createElement('div');
	this.background = document.createElement('div');
	this.image = document.createElement('img');
	this.button = document.createElement('div');
};

var addIDs = function() {
	this.container.id = 'container';
	this.overlays.id = 'overlays';
	this.left.id = 'left';
	this.right.id = 'right';
	this.background.id = 'background';
	this.image.id = 'image';
	this.button.id = 'button';
};

// TODO: account for window margin
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

var handleThumbnailClick = function(thumbnail, data, position) {
	this.index = position;
	this.background.classList.add('active');
	// initialize image
	this.image.style.opacity = 0;
	this.image.src = data.images.standard_resolution.url;

	this.image.onload = function() {
		this.image.style.opacity = 1; // make visible

		// set initial size and position
		setState(this.states.initial, thumbnail, data.images.thumbnail.width/data.images.standard_resolution.width);
		this.image.style.transition = 'none';
		setStyles(this.image, this.states.initial);
	
		// set final size and position
		setState(this.states.final, this.container, 1);
		this.image.style.transition = 'all 0.5s ease';
		setStyles(this.image, this.states.final);

		this.image.onload = null; // remove onload function
	}.bind(this);
};

var addThumbnails = function(thumbnails, number) {
	var thumbnail;
	return Array.apply(null, Array(number)).reduce(function(thumbnails) {
		thumbnail = document.createElement('img');
		thumbnail.classList.add('thumbnail');
		this.container.insertBefore(thumbnail, this.button);
		this.thumbnails.push(thumbnail);
		return this.thumbnails;
	}.bind(this), this.thumbnails);
};

var setThumbnails = function(thumbnails, data, offset) {
	var position;
	data.forEach(function(data, index) {
		position = offset + index;
		thumbnails[position].src = data.images.thumbnail.url;
		thumbnails[position].addEventListener('click', handleThumbnailClick.bind(this, thumbnails[position], data, position));
	}.bind(this));
};

var createOverlay = function(position) {
	var overlay = document.createElement('div');
	overlay.id = position;
	this.overlays.appendChild(overlay);
	return overlay;
};

var handleOverlayClick = function(event) {
	if (event.target.id === 'right') this.index++;
	else if (event.target.id === 'left') this.index--;

	this.index = (this.data.length + this.index) % this.data.length;
	this.image.dispatchEvent(this.updated);
};

var getData = function(url) {
	document.body.removeChild(this.script);
	this.script = document.createElement('script');
	this.script.src = url;
	document.body.appendChild(this.script);
};

var getURL = function(count, callback, param, value) {
	var url = [root, '&count=', count, '&callback=', callback].join('');
	if (param) url += ['&', param, '=', value].join('');
	return url;
};

var handleData = function(json) {
	var offset = this.thumbnails.length;
	addThumbnails.call(this, this.thumbnails, json.data.length);
	setThumbnails.call(this, this.thumbnails, json.data, offset);
	this.data = this.data.concat(json.data);
	this.pagination = json.pagination;
};

document.addEventListener('DOMContentLoaded', function() {
	var lightbox = new Lightbox();
	document.body.appendChild(lightbox);
});
