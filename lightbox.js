var client_id = '38615c1e89344d13b07e194a36915fc8';
var root = 'https://api.instagram.com/v1/tags/smilingfood/media/recent?client_id=' + client_id;

var Lightbox = function(options) {
	// initialize instance variables
	this.data = [];
	this.pagination = {};
	this.thumbnails = [];
	this.index = 0;
	this.states = {
		initial: {},
		final: {}
	};

	this.expandable = true;
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
};

Lightbox.DEFAULT_OPTIONS = {
	columns: 4, // max is 5 — instagram has a 25 image limit
	size: 640
};

Lightbox.prototype.showFooter = function() {
	this.button.style.height = this.options.size/this.options.columns/2;
	this.button.style.lineHeight = this.options.size/this.options.columns/2 + 'px';
};

Lightbox.prototype.hideFooter = function() {
	this.button.style.height = 0;
	this.button.style.lineHeight = 0 + 'px';
};

Lightbox.prototype.showHeader = function() {
	this.bar.style.top = -this.options.size/this.options.columns/2;
	this.bar.style.height = this.options.size/this.options.columns/2;
	this.bar.style.lineHeight = this.options.size/this.options.columns/2 + 'px';
};

Lightbox.prototype.hideHeader = function() {
	this.bar.style.top = 0;
	this.bar.style.height = 0;
	this.bar.style.lineHeight = 0 + 'px';
};

Lightbox.prototype.setTitle = function(title) {
	this.title.innerHTML = title;
};

var setOptions = function(options) {
	Object.keys(options).forEach(function(option) {
		this[option] = options[option];
	}.bind(this));
};

var removeImage = function() {
	this.image.src = 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw=='; // replace with empty src to avoid silver border
	this.image.removeEventListener('transitionend', removeImage);
};

var addEventListeners = function() {
	this.overlays.addEventListener('click', function(event) {
		event.stopPropagation();
	});

	this.left.addEventListener('click', handleOverlayClick.bind(this, -1));
	this.right.addEventListener('click', handleOverlayClick.bind(this, 1));

	this.image.addEventListener('updated', function() {
		if (this.data[this.index].caption.text) this.setTitle(this.data[this.index].caption.text);
		this.image.style.transition = 'none'; // turn off transition
		setState.call(this, this.states.initial, this.thumbnails[this.index], this.data[this.index].images.thumbnail.width/this.data[this.index].images.standard_resolution.width);
		this.image.src = this.data[this.index].images.standard_resolution.url;
	}.bind(this));

	this.bar.addEventListener('click', function(event) {
		this.hideHeader();
		if (this.expandable) this.showFooter();
		this.image.style.transition = 'all 0.5s ease'; // turn transition back on
		this.background.classList.remove('active');
		
		setStyles(this.image, this.states.initial);

		// remove image after transitioned to grid mode
		removeImage = removeImage.bind(this); // must bind remove image to correct context
		this.image.addEventListener('transitionend', removeImage);
	}.bind(this));

	this.button.addEventListener('click', function(event) {
		this.hideFooter();
		this.expandable = false;
		var url = getURL(this.options.columns * this.options.columns, 'handleData', 'max_tag_id', this.pagination.next_max_tag_id);
		getData.call(this, url);
	}.bind(this));

	// display more button when scrolled to the bottom
	this.container.onscroll = function(event) {
		var rows = this.thumbnails.length / this.options.columns;
		var thumbnailSize = this.options.size / this.options.columns;
		if (this.container.scrollTop >= (rows * thumbnailSize) - this.options.size) {
			this.showFooter();
			this.expandable = true;
		} else {
			this.hideFooter();
			this.expandable = false;
		}
	}.bind(this);
};

var appendElements = function() {
	document.body.appendChild(this.script);
	this.overlays.appendChild(this.left);
	this.overlays.appendChild(this.right);
	this.background.appendChild(this.overlays);
	this.container.appendChild(this.background);
	this.container.appendChild(this.image);
	this.bar.appendChild(this.title);
	this.element.appendChild(this.bar);
	this.element.appendChild(this.container);
	this.element.appendChild(this.button);
};

var sizeElements = function() {
	this.element.style.height = this.options.size;
	this.element.style.width = this.options.size;
	this.container.style.height = this.options.size;
	this.container.style.width = this.options.size;
	this.container.style.top = this.options.size/this.options.columns/2;
	this.overlays.style.height = this.options.size;
	this.overlays.style.width = this.options.size;
	this.left.style.height = this.options.size;
	this.left.style.width = this.options.size/2;
	this.right.style.height = this.options.size;
	this.right.style.width = this.options.size/2;
	this.image.style.height = this.options.size;
	this.image.style.width = this.options.size;
	this.hideHeader();
	this.showFooter();
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
	this.bar = document.createElement('div');
	this.button = document.createElement('div');
	this.title = document.createElement('h1');
};

var addIDs = function() {
	this.element.id = 'lightbox';
	this.container.id = 'container';
	this.overlays.id = 'overlays';
	this.left.id = 'left';
	this.right.id = 'right';
	this.background.id = 'background';
	this.image.id = 'image';
	this.bar.id = 'bar';
	this.button.id = 'button';
	this.title.id = 'title';
};

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
	setState.call(this, this.states.initial, thumbnail, 1/this.options.columns);
	this.image.style.transition = 'none';
	setStyles(this.image, this.states.initial);
	this.image.dispatchEvent(this.updated);

	this.hideFooter();
	this.showHeader();

	this.image.onload = function() {
		this.image.style.opacity = 1; // make visible

		// set final size and position
		setState.call(this, this.states.final, this.element, 1);
		this.image.style.transition = 'all 0.5s ease';
		setStyles(this.image, this.states.final);

		this.image.onload = null; // remove onload function
	}.bind(this);
};

var addThumbnails = function(thumbnails, number) {
	var thumbnail;
	var size = this.options.size / this.options.columns;
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
	var lightbox = new Lightbox();
	document.body.appendChild(lightbox.element);
});
