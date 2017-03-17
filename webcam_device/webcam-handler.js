console.log('ok');
// var ffmpeg = require('fluent-ffmpeg');
// var command = new ffmpeg();

// ffmpeg('/dev/video0')
//     .inputFormat('video4linux2')
//     .inputFPS(25)
//     .output('http://192.168.1.138:8081/d1zqvdzz')
//     .format('mpegts')
//     .videoCodec('mpeg1video')
//     .size('640x480')
//     .on('start', function(commandLine) {
//         console.log('Spawned Ffmpeg with command: ' + commandLine);
//     })
//     .on('codecData', function(data) {
//         console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
//     });

var ffmpeg = require('ffmpeg');

try {
    var process = new ffmpeg('/dev/video0');

    process.then(video => {
        console.log('The video is ready to be processed');
    }, err => {
        console.log('Error: ' + err);
    });
} catch (e) {
    console.log(e.code);
    console.log(e.msg);
}

console.log('started');
