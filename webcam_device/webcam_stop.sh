BASEDIR=$(dirname $0)
kill -9 `cat ${BASEDIR}/webcam_pid.txt`
rm ${BASEDIR}/webcam_pid.txt
echo "Webcam stopped"
