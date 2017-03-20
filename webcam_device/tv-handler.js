var exec = require('child_process').exec;

child = exec('echo "on 0" | cec-client -s', function (error, stdout, stderr) {
    console.log("Turned on TV successfully");
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

child = exec('echo "standby 0" | cec-client -s', function (error, stdout, stderr) {
    console.log("Turned off TV successfully");
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
