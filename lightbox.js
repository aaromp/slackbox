var request;

var client_id = '38615c1e89344d13b07e194a36915fc8';
var url = 'https://api.instagram.com/v1/media/popular?client_id=' + client_id;

var callbackFunction = function(data) {
	console.log('success', data);
};

document.addEventListener('DOMContentLoaded', function() {
	var script = document.createElement('script');
	script.src = url + '&callback=' + 'callbackFunction';
	document.body.appendChild(script);
});
