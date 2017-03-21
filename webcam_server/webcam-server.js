// Use this server to serve a raw MPEG-TS over WebSockets. You can use ffmpeg to feed the server.
// Example:
// ffmpeg -r 25 -i <source> -f mpegts -codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 http://<serverIp>:8081/<yoursecret>

// REQUIRED FILE: webcam-secret.json - Content example: "secret"

var http = require('http'),
    WebSocket = require('ws'),
    firebase = require('firebase'),
    streamSecret = require('./webcam-secret.json');

firebase.initializeApp({
    apiKey: "AIzaSyCcqVCaKizJ-HvqQaHQ86HUlZpdGVGCWPU",
    authDomain: "interactive-board-999c5.firebaseapp.com",
    databaseURL: "https://interactive-board-999c5.firebaseio.com",
    storageBucket: "interactive-board-999c5.appspot.com"
});

var socketServer,
    streamServer,
    streamPort,
    websocketPort,
    streamOpen = false;

firebase.database().ref('/streamOpen').on('value', function(payload) {
    streamOpen = payload.val() === true ? true : false;
});

firebase.database().ref('/server').on('value', function(payload) {
    streamPort = payload.val().streamPort;
    websocketPort = payload.val().websocketPort;

    // Websocket Server
    socketServer = new WebSocket.Server({port: websocketPort, perMessageDeflate: false});
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
        if (streamOpen) {
            socketServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    };

    // HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
    streamServer = http.createServer( function(request, response) {
        var params = request.url.substr(1).split('/');

        if (params[0] !== streamSecret) {
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
    }).listen(streamPort);

    console.log('Listening for incomming MPEG-TS Stream on http://<server-ip>:'+streamPort+'/'+streamSecret);
    console.log('Awaiting WebSocket connections on ws://<server-ip>:'+websocketPort+'/');
});
