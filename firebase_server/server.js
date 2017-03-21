'use strict';

let firebase = require('firebase-admin');
let serviceAccount = require("./interactive-board-account.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://interactive-board-999c5.firebaseio.com'
});

let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

let maxMagnets;
let fixedInterval;
let availableColors;

let maxRef = firebase.database().ref('/constants/maxNumberOfMagnets');
let intervalRef = firebase.database().ref('/constants/intervalBetweenDraws');
let colorsRef = firebase.database().ref('/constants/availableColors');

let statusRef = firebase.database().ref('/status');
let serverRef = firebase.database().ref('/server');
let streamHoursRef = firebase.database().ref('/streamHours');
let streamOpenRef = firebase.database().ref('/streamOpen');
let lettersRef = firebase.database().ref('/letters');
let magnetsRef = firebase.database().ref('/magnets');
let dyingMagnetsRef = firebase.database().ref('/dyingMagnets');

let magnetsInOrder = [];
let magnetsProcessing = [];
let localLettersList = [];

let lettersRefListener = true;
let maxRefListener = true;
let intervalRefListener = true;
let colorsRefListener = true;

let serverStarted = false;

let drawTimeout = null;

let serverNextDraw = 0;

let resettedLettersList = {};
for (let letter of letters) {
    resettedLettersList[letter] = false;
}

function setupFirebase() {
    lettersRef.once('value', payload => {
        for (let letter of letters) {
            if (!(payload.exists() && letter in payload.val())) {
                lettersRef.set(resettedLettersList);
                console.log('Letters list setted');
                break;
            }
        }
    });

    statusRef.once('value', payload => {
        if (!(payload.exists() && 'lastDraw' in payload.val() && 'nextDraw' in payload.val())) {
            statusRef.set({
                lastDraw: 0,
                nextDraw: 0
            });
            console.log('Server status setted');
        } else {
            serverNextDraw = payload.val().nextDraw;
        }
    });

    serverRef.once('value', payload => {
        if (!(payload.exists() && 'ip' in payload.val() && 'streamPort' in payload.val() && 'websocketPort' in payload.val())) {
            serverRef.set({
                ip: '192.168.1.0',
                streamPort: '8081',
                websocketPort: '8082'
            });
            console.log('Server ip setted');
        }
    });





    // Opening hours
    let p1 = new Promise((resolve, reject) => {
        streamHoursRef.once('value', payload => {
            if (!(payload.exists() && 'open' in payload.val() && 'close' in payload.val() && 'daysOpen' in payload.val())) {
                streamHoursRef.set({
                    open: '',
                    close: '',
                    daysOpen: {
                        monday: true,
                        tuesday: true,
                        wednesday: true,
                        thursday: true,
                        friday: true,
                        saturday: true,
                        sunday: true
                    }
                });
                console.log('Stream hours setted');
            }
            resolve();
        });
    });

    let p2 = new Promise((resolve, reject) => {
        streamOpenRef.once('value', payload => {
            if (!(payload.exists())) {
                streamOpenRef.set(false);
                console.log('Stream openning setted');
            }
            resolve();
        });
    });

    Promise.all([p1, p2]).then(() => {
        setStreamOpenningHours();
    });
}

function hourInInterval(now) {
    return (now.getHours() > openHour[0] && now.getHours() < closeHour[0]) || (now.getHours() === openHour[0] && now.getMinutes() >= openHour[1]) || (now.getHours() === closeHour[0] && now.getMinutes() < closeHour[1]);
}

function setStreamOpenningHours() {
    let openHour;
    let closeHour;
    let openDays;
    let hoursFormatRegEx = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;

    streamHoursRef.on('value', payload => {
        let streamHours = payload.val();
        openHour = [];
        closeHour = [];
        openDays = [];
        if (hoursFormatRegEx.test(streamHours.open) && hoursFormatRegEx.test(streamHours.close)) {
            openHour = [parseInt(streamHours.open.split(':')[0]), parseInt(streamHours.open.split(':')[1])];
            closeHour = [parseInt(streamHours.close.split(':')[0]), parseInt(streamHours.close.split(':')[1])];
        }

        for (let day in streamHours.daysOpen) {
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

    setInterval(() => {
        let now = new Date();
        let streamOpen = openDays.indexOf(now.getDay()) >= 0 && (openHour.length === 0 || hourInInterval(now));
        streamOpenRef.once('value', payload => {
            if (streamOpen !== payload.val()) {
                streamOpenRef.set(streamOpen);
            }
        });
    }, 1000);
}







function buildMagnetsOrderedList() {
    magnetsRef.orderByChild('timestamp').once('value', payload => {
        if (payload.exists()) {
            magnetsInOrder = [];
            payload.forEach(firebaseMagnet => {
                magnetsInOrder.push(firebaseMagnet.key);
            });
            setDyingMagnets();
        }
    });
}

function buildLettersList() {
    lettersRef.once('value', payload => {
        if (payload.exists()) {
            localLettersList = [];
            payload.forEach(firebaseLetter => {
                if (firebaseLetter.val()) {
                    localLettersList.push(firebaseLetter.key);
                }
            });
        }
    });
}

function startListeners() {
    let p1 = new Promise((resolve, reject) => {
        maxRef.on('value', postSnapshot => {
            if (maxRefListener) {
                if (postSnapshot.val() && postSnapshot.val() > 0) {
                    maxMagnets = postSnapshot.val();
                } else {
                    maxRefListener = false;
                    maxMagnets = 25;
                    maxRef.set(maxMagnets).then(() => {
                        maxRefListener = true;
                    });
                }

                resolve();

                setDyingMagnets();
            }
        });
    });

    let p2 = new Promise((resolve, reject) => {
        intervalRef.on('value', postSnapshot => {
            if (intervalRefListener) {
                if (postSnapshot.val() && postSnapshot.val() > 0) {
                    fixedInterval = postSnapshot.val();
                } else {
                    intervalRefListener = false;
                    fixedInterval = 300;
                    intervalRef.set(fixedInterval).then(() => {
                        intervalRefListener = true;
                    });
                }

                resolve();

                if (drawTimeout) {
                    clearTimeout(drawTimeout);
                    drawTimeout = null;
                }
                generateDraw();
            }
        });
    });

    let p3 = new Promise((resolve, reject) => {
        colorsRef.on('value', postSnapshot => {
            if (colorsRefListener) {
                if (postSnapshot.val() && postSnapshot.val().length > 0) {
                    availableColors = postSnapshot.val();
                } else {
                    colorsRefListener = false;
                    availableColors = ['red', 'green', 'orange', blue, pink, purple];
                    colorsRef.set(availableColors).then(() => {
                        colorsRefListener = true;
                    });
                }
            }

            resolve();
        });
    });

    Promise.all([p1, p2, p3]).then(() => {
        if (!serverStarted) {
            serverStarted = true;

            lettersRef.on('child_changed', postSnapshot => {
                if (lettersRefListener && postSnapshot.val()) {
                    handleLetter(postSnapshot);
                }
            });

            magnetsRef.on('child_changed', postSnapshot => {
                if (postSnapshot.exists()) {
                    handleMagnet(postSnapshot);
                }
            });

            magnetsRef.on('child_removed', postSnapshot => {
               magnetsInOrder.splice(magnetsInOrder.indexOf(postSnapshot.key), 1);
               setDyingMagnets();
            });

            console.log('Server started');
        }
    });
}

function handleLetter(firebaseLetter) {
    localLettersList.push(firebaseLetter.key);

    let now = + new Date();
    if (serverNextDraw > now) {
        if (!drawTimeout) {
            drawTimeout = setTimeout(() => {
                generateDraw();
                drawTimeout = null;
            }, serverNextDraw - now);
        }
    } else {
        if (drawTimeout) {
            clearTimeout(drawTimeout);
            drawTimeout = null;
        }
        generateDraw();
    }
}

function handleMagnet(firebaseMagnet) {
    if (magnetsProcessing.indexOf(firebaseMagnet.key) === -1) {
        magnetsProcessing.push(firebaseMagnet.key);
        firebase.database().ref('/magnets/' + firebaseMagnet.key).update({
            timestamp: + new Date()
        }).then(() => {
            magnetsProcessing.splice(magnetsProcessing.indexOf(firebaseMagnet.key), 1);
        });

        // Put modified magnet at the end of the array
        magnetsInOrder.push(magnetsInOrder.splice(magnetsInOrder.indexOf(firebaseMagnet.key), 1)[0]);
        setDyingMagnets();
    }
}

function setDyingMagnets() {
    if (magnetsInOrder.length >= maxMagnets) {
        dyingMagnetsRef.set(magnetsInOrder.slice(0, magnetsInOrder.length - maxMagnets + 1));
    } else {
        dyingMagnetsRef.remove();
    }
}

function generateDraw() {
    serverNextDraw = 0;

    if (magnetsInOrder.length >= maxMagnets) {
        serverNextDraw = (+ new Date()) + fixedInterval * 1000;
        if (localLettersList.length > 0) {
            for (let dyingMagnetId of magnetsInOrder.slice(0, magnetsInOrder.length - maxMagnets + 1)) {
                firebase.database().ref('/magnets/' + dyingMagnetId).remove();
            }
        }
    }

    if (localLettersList.length > 0) {
        lettersRefListener = false;
        lettersRef.set(resettedLettersList).then(() => {
            createMagnet(localLettersList[Math.floor(Math.random() * localLettersList.length)]);

            statusRef.update({
                lastDraw: + new Date(),
                nextDraw: serverNextDraw
            });

            localLettersList = [];
            lettersRefListener = true;
        });
    } else {
        statusRef.update({
            lastDraw: + new Date(),
            nextDraw: serverNextDraw
        });
    }
}

function createMagnet(type) {
    magnetsRef.push({
        type: type,
        color: availableColors[Math.floor(Math.random() * availableColors.length)],
        timestamp: + new Date()
    });

    buildMagnetsOrderedList();
}

setupFirebase();
buildMagnetsOrderedList();
buildLettersList();
startListeners();


// Manually instruct firebase from server console
let stdin = process.openStdin();
stdin.addListener("data", function(d) {
    let command = d.toString().trim();

    if (command === 'add magnet') {
        setTimeout(function() {
            createMagnet('a');
            console.log('Magnet created');
        }, 2000)
    }
});
