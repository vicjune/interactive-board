// TODO create firebase rules
'use strict';

let firebase = require('firebase-admin');
let serviceAccount = require("./interactive-board-account.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://interactive-board-999c5.firebaseio.com'
});

let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
let lettersRef = firebase.database().ref('/letters');
let magnetsRef = firebase.database().ref('/magnets');
let statusRef = firebase.database().ref('/status');

function setupFirebase() {
    lettersRef.once('value', payload => {
        for (let letter of letters) {
            if (!(payload.exists() && letter in payload.val())) {
                let formatedList = {};
                for (let letter of letters) {
                    formatedList[letter] = false;
                }
                lettersRef.set(formatedList);
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

function startListeners() {
    lettersRef.on('value', postSnapshot => {
        console.log('letter modified');
    });
    console.log('Server started');
}

function createMagnet(type, color) {
    magnetsRef.push({
        type: type,
        color: color
    });
}

setupFirebase();
startListeners();


// Affect firebase from server console
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
