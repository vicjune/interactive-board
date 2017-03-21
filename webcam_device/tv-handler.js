let exec = require('child_process').exec;
//firebase

setInterval(() => {
    exec('echo "pow 0" | cec-client -s', (error, stdout, stderr) => {
        if (error === null) {
            let n = stdout.indexOf("power status:");
            status_temp = stdout.substring(n+13, n+28);
            status = status_temp.substring(0, status_temp.indexOf("D")-1);
            if (status === 'on' && !openingHours) {
                turnTv('standby');
            }
            if (status === 'standby' && openingHours) {
                turnTv('on');
            }
        } else {
            console.log('exec error: ' + error);
        }
    });
}, 60000);

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
