console.log('ok');
var ffmpeg = require('fluent-ffmpeg');
var command = new ffmpeg();

ffmpeg('/dev/video0')
    .inputFormat('video4linux2')
    .inputFPS(25)
    .output('http://192.168.1.138:8081/d1zqvdzz')
    .format('mpegts')
    .videoCodec('mpeg1video')
    .size('640x480')
    .on('start', function(commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
    });

console.log('started');
