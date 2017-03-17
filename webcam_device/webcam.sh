BASEDIR=$(dirname $0)
nohup ffmpeg -r 25 -f video4linux2 -i /dev/video0 -f mpegts -codec:v mpeg1video -s 640x480 `cat ${BASEDIR}/webcam_serverIp.txt` > ${BASEDIR}/webcam.log 2>&1 &
echo $! > ${BASEDIR}/webcam_pid.txt
echo "Check logs in ${BASEDIR}/webcam.log"
