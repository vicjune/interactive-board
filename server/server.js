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
let lastMagnetRef = firebase.database().ref('/lastMagnet');

let magnetsInOrder = [];
let localLettersList = [];

let magnetsListListener = true;
let lettersListListener = true;

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
            if (magnetsInOrder.length >= 25) {
                lastMagnetRef.set(magnetsInOrder[0]);
            } else {
                lastMagnetRef.set(null);
            }
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
        if (lettersListListener) {
            handleLetter(postSnapshot);
        }
    });

    magnetsRef.on('child_changed', postSnapshot => {
        if (postSnapshot.exists() && magnetsListListener) {
            handleMagnet(postSnapshot);
        }
    });

    console.log('Server started');
}

function handleLetter(firebaseLetter) {
    if (magnetsInOrder.length >= maxMagnets) {

    } else {
        lettersListListener = false;
        localLettersList = [];
        lettersRef.set(resettedLettersList).then(() => {
            createMagnet(firebaseLetter.key);
            statusRef.update({
                lastDraw: + new Date(),
                nextDraw: 0
            });
            lettersListListener = true;
        });
    }
}

function handleMagnet(firebaseMagnet) {
    firebase.database().ref('/magnets/' + firebaseMagnet.key).update({
        timestamp: + new Date()
    });

    // Put modified magnet at the end of the array
    magnetsInOrder.push(magnetsInOrder.splice(magnetsInOrder.indexOf(firebaseMagnet.key), 1)[0]);
    if (magnetsInOrder.length >= maxMagnets) {
        lastMagnetRef.set(magnetsInOrder[0]);
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


// Instruct firebase from server console
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
