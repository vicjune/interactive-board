// REQUIRED FILE: webcam-secret.json - Content example: "secret"

let exec = require('child_process').exec;
let streamSecret = require('./webcam-secret.json');
let firebase = require('firebase');

firebase.initializeApp({
    apiKey: "AIzaSyCcqVCaKizJ-HvqQaHQ86HUlZpdGVGCWPU",
    authDomain: "interactive-board-999c5.firebaseapp.com",
    databaseURL: "https://interactive-board-999c5.firebaseio.com",
    storageBucket: "interactive-board-999c5.appspot.com"
});

// let webcamExec = null;
// let interval = null;
let streamOpen = false;

firebase.database().ref('/server').once('value', server => {
    startWebcam(server);
});

function startWebcam(server) {
    console.log('--------startWebcam');
    webcamExec = exec('ffmpeg -r 25 -f video4linux2 -i /dev/video0 -f mpegts -codec:v mpeg1video -s 640x480 http://' + server.val().ip + ':' + server.val().streamPort + '/' + streamSecret + ' > ' + __dirname + '/webcam.log', (error, stdout, stderr) => {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        console.log('--------setTimeout');
        setTimeOut(() => {
            console.log('--------start again');
            arguments.callee(server);
        }, 10000);
    });
}


firebase.database().ref('/streamOpen').on('value', payload => {
    streamOpen = payload.val() === true ? true : false;

    exec('echo "pow 0" | cec-client -s', (error, stdout, stderr) => {
        if (error === null) {
            let n = stdout.indexOf("power status:");
            let status_temp = stdout.substring(n+13, n+28);
            let status = status_temp.substring(0, status_temp.indexOf("D")-1).trim();
            if (status === 'on' && !streamOpen) {
                turnTv('standby');
            }
            if (status === 'standby' && streamOpen) {
                turnTv('on');
            }
        } else {
            console.log('exec error: ' + error);
        }
    });

    // firebase.database().ref('/server').on('value', server => {
    //     if (streamOpen && webcamExec === null) {
    //         console.log('------------------start stream');
    //         webcamExec = exec('ffmpeg -r 25 -f video4linux2 -i /dev/video0 -f mpegts -codec:v mpeg1video -s 640x480 http://' + server.val().ip + ':' + server.val().streamPort + '/' + streamSecret + ' > ' + __dirname + '/webcam.log', (error, stdout, stderr) => {
    //             if (error !== null) {
    //                 console.log('exec error: ' + error);
    //             }
    //             webcamExec = null;
    //             console.log('---------------end of stream');
    //         });
    //     }
    //     if (!streamOpen && webcamExec !== null) {
    //         webcamExec.kill();
    //         webcamExec = null;
    //         console.log('------------------kill stream');
    //     }
    // });
});

function turnTv (newStatus) {
    exec('echo "' + newStatus + ' 0" | cec-client -s', (error, stdout, stderr) => {
        if (error === null) {
            if (newStatus === 'on') {
                exec('echo "as" | cec-client -s', (error, stdout, stderr) => {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
            }
        } else {
            console.log('exec error: ' + error);
        }
    });
}
