// TODO create firebase rules
'use strict';

var firebase = require('firebase-admin');
var serviceAccount = require("./interactive-board-account.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://interactive-board-999c5.firebaseio.com'
});

function startListeners() {
    firebase.database().ref('/letters').on('child_added', function(postSnapshot) {
        console.log('letter added');
    });
    console.log('Server started');
    //TODO check if firebase bdd is already setup and else create folders and stuff
}

function createMagnet(type, color) {
    firebase.database().ref('/magnets').push({
        type: type,
        color: color
    });
}

startListeners();
