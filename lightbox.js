var client_id = '38615c1e89344d13b07e194a36915fc8';
var root = 'https://api.instagram.com/v1/tags/iceland/media/recent?client_id=' + client_id;

var Lightbox = function(options) {
	this.data = [];
	this.pagination = {};
	this.thumbnails = [];
	this.index = 0;
	this.states = {
		initial: {},
		final: {}
	};
	this.updated = new Event('updated');

	// set options
	this.options = Lightbox.DEFAULT_OPTIONS;
	if (options) setOptions.call(this.options, options);

	createElements.call(this);
	sizeElements.call(this);
	addIDs.call(this);
	appendElements.call(this);
	addEventListeners.call(this);

	// initialize with data
	window.handleData = handleData.bind(this); // must bind global callback to correct context
	getData.call(this, getURL(this.options.columns * this.options.columns, 'handleData'));

	return this.element;
};

Lightbox.DEFAULT_OPTIONS = {
	columns: 4,
	thumbnailSize: 150,
	detailSize: 640
};

var setOptions = function(options) {
	console.log('setting options');
	Object.keys(options).forEach(function(option) {
		this[option] = options[option];
	}.bind(this));
};

var addEventListeners = function() {
	this.overlays.addEventListener('click', function(event) {
		event.stopPropagation();
	});

	this.left.addEventListener('click', handleOverlayClick.bind(this, -1));
	this.right.addEventListener('click', handleOverlayClick.bind(this, 1));

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
		setState.call(this, this.states.initial, this.thumbnails[this.index], this.data[this.index].images.thumbnail.width/this.data[this.index].images.standard_resolution.width);
		this.image.src = this.data[this.index].images.standard_resolution.url;
	}.bind(this));

	this.button.addEventListener('click', function(event) {
		var url = getURL(this.options.columns * this.options.columns, 'handleData', 'max_tag_id', this.pagination.next_max_tag_id);
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
	this.container.appendChild(this.image);
	this.element.appendChild(this.container);
	this.element.appendChild(this.button);
};

var sizeElements = function() {
	this.element.style.height = this.options.detailSize;
	this.element.style.width = this.options.detailSize;
	this.container.style.height = this.options.detailSize;
	this.container.style.width = this.options.detailSize;
	this.overlays.style.height = this.options.detailSize;
	this.overlays.style.width = this.options.detailSize;
	this.left.style.height = this.options.detailSize;
	this.left.style.width = this.options.detailSize/2;
	this.right.style.height = this.options.detailSize;
	this.right.style.width = this.options.detailSize/2;
	this.image.style.height = this.options.detailSize;
	this.image.style.width = this.options.detailSize;
};

var createElements = function() {
	this.script = document.createElement('script');
	this.element = document.createElement('div');
	this.container = document.createElement('div');
	this.overlays = document.createElement('div');
	this.left = document.createElement('div');
	this.right = document.createElement('div');
	this.background = document.createElement('div');
	this.image = document.createElement('img');
	this.button = document.createElement('div');
};

var addIDs = function() {
	this.element.id = 'lightbox';
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
	state.top = (container.getBoundingClientRect().height/2) + container.getBoundingClientRect().top - this.element.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
	state.left = (container.getBoundingClientRect().width/2) + container.getBoundingClientRect().left - this.element.getBoundingClientRect().left - document.body.getBoundingClientRect().left;	
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
		setState.call(this, this.states.initial, thumbnail, this.options.thumbnailSize/this.options.detailSize);
		this.image.style.transition = 'none';
		setStyles(this.image, this.states.initial);
	
		// set final size and position
		setState.call(this, this.states.final, this.element, 1);
		this.image.style.transition = 'all 0.5s ease';
		setStyles(this.image, this.states.final);

		this.image.onload = null; // remove onload function
	}.bind(this);
};

var addThumbnails = function(thumbnails, number) {
	var thumbnail;
	var size = this.options.detailSize / this.options.columns;
	return Array.apply(null, Array(number)).reduce(function(thumbnails) {
		thumbnail = document.createElement('img');
		thumbnail.classList.add('thumbnail');
		thumbnail.style.height = size;
		thumbnail.style.width = size;
		this.container.appendChild(thumbnail);
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

var handleOverlayClick = function(change, event) {
	this.index = (this.data.length + this.index + change) % this.data.length;
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
	var lightbox = new Lightbox({columns: 3});
	document.body.appendChild(lightbox);
});
