let exec = require('child_process').exec,
    firebase = require('firebase');

firebase.initializeApp({
    apiKey: "AIzaSyCcqVCaKizJ-HvqQaHQ86HUlZpdGVGCWPU",
    authDomain: "interactive-board-999c5.firebaseapp.com",
    databaseURL: "https://interactive-board-999c5.firebaseio.com",
    storageBucket: "interactive-board-999c5.appspot.com"
});

firebase.database().ref('/streamOpen').on('value', function(payload) {
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

    exec('ffmpeg -r 25 -f video4linux2 -i /dev/video0 -f mpegts -codec:v mpeg1video -s 640x480 `cat /home/pi/Projects/interactive-board/webcam_device/webcam_serverIp.txt` > /home/pi/Projects/interactive-board/webcam_device/webcam.log', (error, stdout, stderr) => {
        if (error === null) {
            console.log('ok');
        } else {
            console.log('exec error: ' + error);
        }
    });
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
