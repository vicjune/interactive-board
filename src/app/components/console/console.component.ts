import { Component, OnInit } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';
import { Letter } from './../../classes/letter';
import { Constants } from './../../constants';

@Component({
    selector: 'console',
    templateUrl: './console.template.html',
    styleUrls: ['./console.style.css']
})
export class ConsoleComponent implements OnInit {
    constructor(
        private FirebaseService: FirebaseService,
        private ErrorService: ErrorService
    ) {}

    serverStatus = null;
    letters: Letter[] = [];
    state = {
        ready: false,
        letterSelected: false,
        timeLeft: 0,
        percentageLeft: 0,
        interval: null
    }
    error = {
        display: false,
        message: '',
        timeout: null
    }

    ngOnInit() {
        for (let i = 0; i < Constants.LETTERS.length; ++i) {
            this.letters.push({
                selected: false,
                voted: false,
                type: Constants.LETTERS[i]
            });
        }

        this.FirebaseService.bindStatusObject().subscribe(
            firebaseStatus => {
                this.serverStatus = firebaseStatus;
                this.setTimer();
                this.reset();
            }
        );

        this.FirebaseService.bindLetterList().subscribe(
            firebaseList => {
                for (let i = 0; i < this.letters.length; ++i) {
                    this.letters[i].voted = false;

                    firebaseList.forEach(item => {
                        if (this.letters[i].type === item.type) {
                            this.letters[i].voted = true;
                        }
                    });
                }
                this.state.ready = true;
            }
        );


        this.ErrorService.output().subscribe(
            message => this.handleError(message)
        );
    }

    selectLetter(letter: Letter) {
        if (this.noLetterSelected()) {
            if (!letter.voted) {
                this.state.letterSelected = true;
                letter.selected = true;
                this.FirebaseService.addLetter(letter.type)
                .then(() => {})
                .catch(error => {
                    this.ErrorService.input('connection', error);
                    letter.selected = false;
                })
            } else {
                this.ErrorService.input('letter-voted');
            }
        } else {
            this.ErrorService.input('letter-selected');
        }
    }

    private reset() {
        this.state.letterSelected = false;
    }

    private setTimer() {
        let now;
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
        this.state.interval = setInterval(() => {
            now = + new Date;
            this.state.timeLeft = Math.floor((this.serverStatus.nextDraw - now) / 1000);
            this.state.percentageLeft = Math.floor((this.serverStatus.nextDraw - now) / (this.serverStatus.nextDraw - this.serverStatus.lastDraw) * 100 );
        }, 1000);
    }

    private noLetterSelected(): boolean {
        return this.letters.every(item => item.selected === false);
    }

    private handleError(message: string) {
        this.error.message = message;
        this.error.display = true;

        if (this.error.timeout) {
            clearTimeout(this.error.timeout);
        }

        this.error.timeout = setTimeout(() => {
            this.error.display = false;
        }, 2000);
    }
}
