// TODO create firebase rules
'use strict';

let firebase = require('firebase-admin');
let serviceAccount = require("./interactive-board-account.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://interactive-board-999c5.firebaseio.com'
});

// TODO dynamic max, interval and colors from firebase & setup by the server if no folder present
let maxMagnets = 25;
let fixedInterval = 300;
let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
let availableColors = ['red', 'green', 'orange', 'purple'];

let statusRef = firebase.database().ref('/status');
let lettersRef = firebase.database().ref('/letters');
let magnetsRef = firebase.database().ref('/magnets');
let dyingMagnetsRef = firebase.database().ref('/dyingMagnets');

let magnetsInOrder = [];
let localLettersList = [];

let lettersListListener = true;
let drawTimeout = null;

let serverLastDraw = 0;
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
            serverLastDraw = payload.val().lastDraw;
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
    lettersRef.on('child_changed', postSnapshot => {
        if (lettersListListener && postSnapshot.val()) {
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
}

function handleLetter(firebaseLetter) {
    localLettersList.push(firebaseLetter.key);

    if (magnetsInOrder.length >= maxMagnets) {
        let now = + new Date();
        if (serverNextDraw > now) {
            if (!drawTimeout) {
                drawTimeout = setTimeout(() => {
                    generateDraw(true);
                }, serverNextDraw - now);
            }
        } else {
            // if () {

            // }
        }
    } else {
        generateDraw(false);
    }

    // simplify this, first if not required, param of generateDraw not required
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
        dyingMagnetsRef.set(null);
    }
}

function generateDraw(deleteDyingMagnets) {
    lettersListListener = false;
    lettersRef.set(resettedLettersList).then(() => {
        createMagnet(localLettersList[Math.floor(Math.random() * localLettersList.length)]);
        statusRef.update({
            lastDraw: + new Date(),
            nextDraw: 0
        });
        localLettersList = [];
        lettersListListener = true;
    });
    if (deleteDyingMagnets) {
        //TODO delete all magnets of dying magnets array
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
console.log('Server started');


// TEMP Instruct firebase from server console
let stdin = process.openStdin();
stdin.addListener("data", function(d) {
    let command = d.toString().trim();

    if (command === 'add magnet') {
        setTimeout(function() {
            createMagnet('a', 'blue');
            console.log('Magnet created');
        }, 2000)
    }
});
