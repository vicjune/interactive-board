// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret
// ffmpeg -r 25 -i <source> -f mpegts -codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 http://<serverIp>:8081/<yoursecret>

// REQUIRED FILE: config.json
// REQUIRED FILE: websocket-secret.json - Content example: "secret"

var fs = require('fs'),
	http = require('http'),
    WebSocket = require('ws'),
	firebase = require('firebase'),
    config = require('./config.json'),
    secret = require('./websocket-secret.json');

var STREAM_SECRET = secret,
	STREAM_PORT = config.streamPort || 8081,
	WEBSOCKET_PORT = config.websocketPort || 8082,
	RECORD_STREAM = config.recordStream || false,
    openHour = [],
    closeHour = [],
    openDays = [];

firebase.initializeApp({
    apiKey: "AIzaSyCcqVCaKizJ-HvqQaHQ86HUlZpdGVGCWPU",
    authDomain: "interactive-board-999c5.firebaseapp.com",
    databaseURL: "https://interactive-board-999c5.firebaseio.com",
    storageBucket: "interactive-board-999c5.appspot.com"
});

var hoursFormatRegEx = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;
firebase.database().ref('/streamHours').on('value', function(payload) {
    var streamHours = payload.val();
    openHour = [];
    closeHour = [];
    openDays = [];
    if (hoursFormatRegEx.test(streamHours.open) && hoursFormatRegEx.test(streamHours.close)) {
        openHour = [parseInt(streamHours.open.split(':')[0]), parseInt(streamHours.open.split(':')[1])];
        closeHour = [parseInt(streamHours.close.split(':')[0]), parseInt(streamHours.close.split(':')[1])];
    }

    for (var day in streamHours.daysOpen) {
        if (streamHours.daysOpen.hasOwnProperty(day) && streamHours.daysOpen[day]) {
            switch(day) {
                case 'monday':
                    openDays.push(1);
                    break;
                case 'tuesday':
                    openDays.push(2);
                    break;
                case 'wednesday':
                    openDays.push(3);
                    break;
                case 'thursday':
                    openDays.push(4);
                    break;
                case 'friday':
                    openDays.push(5);
                    break;
                case 'saturday':
                    openDays.push(6);
                    break;
                case 'sunday':
                    openDays.push(0);
                    break;
            }
        }
    }
});


// Websocket Server
var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket) {
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ',
		socket.upgradeReq.socket.remoteAddress,
		socket.upgradeReq.headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
    var now = new Date();
    if (openDays.indexOf(now.getDay()) >= 0 && (openHour.length === 0 || hourInInterval(now))) {
    	socketServer.clients.forEach(function each(client) {
    		if (client.readyState === WebSocket.OPEN) {
    			client.send(data);
    		}
    	});
    }
};

function hourInInterval(now) {
    return (now.getHours() > openHour[0] && now.getHours() < closeHour[0]) || (now.getHours() === openHour[0] && now.getMinutes() >= openHour[1]) || (now.getHours() === closeHour[0] && now.getMinutes() < closeHour[1])
}

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	var params = request.url.substr(1).split('/');

	if (params[0] !== STREAM_SECRET) {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}

	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' +
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		socketServer.broadcast(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
	});
	request.on('end',function(){
		console.log('close');
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
}).listen(STREAM_PORT);

console.log('Listening for incomming MPEG-TS Stream on http://<server-ip>:'+STREAM_PORT+'/'+secret);
console.log('Awaiting WebSocket connections on ws://<server-ip>:'+WEBSOCKET_PORT+'/');
