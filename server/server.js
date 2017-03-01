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
let lettersRef = firebase.database().ref('/letters');
let magnetsRef = firebase.database().ref('/magnets');
let dyingMagnetsRef = firebase.database().ref('/dyingMagnets');

let magnetsInOrder = [];
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
                    availableColors = ['red', 'green', 'orange'];
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
    firebase.database().ref('/magnets/' + firebaseMagnet.key).update({
        timestamp: + new Date()
    });

    // Put modified magnet at the end of the array
    magnetsInOrder.push(magnetsInOrder.splice(magnetsInOrder.indexOf(firebaseMagnet.key), 1)[0]);
    setDyingMagnets();
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
