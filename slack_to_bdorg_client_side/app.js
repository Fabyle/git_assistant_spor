/**
 * slack_to_bdorg_client_side
 */
// requirements
var request = require("request");
var io = require('socket.io-client');

// ------------------- read the properties file

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./properties');

var url_bdorg = properties.get('main.url.bdorg');
console.log ("la configuration de main.url.bdorg est : "+url_bdorg);

var url_web_socket = properties.get('main.url.web_socket');
console.log ("la configuration de 'main.url.web_socket est : "+url_web_socket);


//------------------- function to call the bdorg
var call_bdorg = function(msg,callback){
	// --- msg = /utilisateurs/search?lb_nom=lemoine
	var requete = url_bdorg+msg;
	request(requete, function(error, response, body) {
		  //console.log(body);
		  callback(body);
		});
};

//------------------- open the connexion on the web socket
var socket = io.connect(url_web_socket, {reconnect: true});

//------------------- check the connection 
socket.on('connect', function (socket) {
    console.log('Connected!');
});

//------------------- listenning for BDORG
socket.on('BDORG',function (from, msg) {
	call_bdorg(msg,function(body){
		socket.emit('BDORG', 'bdorg_bot', body);
	});
	
});







