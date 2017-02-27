import { Component, OnInit } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';
import { Letter } from './../../interfaces/letter';
import { Constants } from './../../constants';

@Component({
    moduleId: module.id,
    selector: 'console',
    templateUrl: 'console.template.html',
    styleUrls: ['console.style.css']
})
export class ConsoleComponent implements OnInit {
    constructor(
        private FirebaseService: FirebaseService,
        private ErrorService: ErrorService
    ) {}

    serverStatus;
    letters: Letter[] = [];
    state = {
        ready: false,
        letterSelected: false,
        timeLeft: 0,
        percentageDisplay: '',
        interval: null
    }
    error = {
        display: false,
        message: '',
        timeout: null
    }

    ngOnInit(): void {
        for (let letter of Constants.LETTERS) {
            this.letters.push({
                selected: false,
                voted: false,
                type: letter
            });
        }

        this.FirebaseService.bindStatusObject().subscribe(
            firebaseStatus => {
                this.serverStatus = firebaseStatus;
                this.setTimer();
                this.reset();
            }
        );

        this.FirebaseService.bindLettersObject().subscribe(
            firebaseObject => {
                for (let letter of this.letters) {
                    letter.voted = firebaseObject[letter.type];
                }
                this.state.ready = true;
            }
        );


        this.ErrorService.output().subscribe(
            message => this.handleError(message)
        );
    }

    selectLetter(letter: Letter): void {
        if (this.noLetterSelected()) {
            if (!letter.voted) {
                this.state.letterSelected = true;
                letter.selected = true;
                this.FirebaseService.setLetter(letter.type)
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

    private reset(): void {
        this.state.letterSelected = false;
    }

    private setTimer(): void {
        if (this.state.interval) {
            clearInterval(this.state.interval);
        }
        this.state.interval = setInterval(() => {
            let now = + new Date;
            this.state.timeLeft = Math.floor((this.serverStatus.nextDraw - now) / 1000);
            let percentage = Math.floor((this.serverStatus.nextDraw - now) / (this.serverStatus.nextDraw - this.serverStatus.lastDraw) * 100 );

            if (percentage <= 50) {
                this.state.percentageDisplay = 'linear-gradient(90deg, rgba(250, 250, 250, 1) 50%, transparent 50%, transparent), linear-gradient(' + (360 * percentage / 100 + 90) + 'deg, #4c91ff 50%, rgba(250, 250, 250, 1) 50%, rgba(250, 250, 250, 1))';
            } else {
                this.state.percentageDisplay = 'linear-gradient(' + (360 * percentage / 100 - 270) + 'deg, #4c91ff 50%, transparent 50%, transparent), linear-gradient(270deg, #4c91ff 50%, rgba(250, 250, 250, 1) 50%, rgba(250, 250, 250, 1))';
            }
        }, 1000);
    }

    private noLetterSelected(): boolean {
        return this.letters.every(item => item.selected === false);
    }

    private handleError(message: string): void {
        this.error.message = message;
        this.error.display = true;

        if (this.error.timeout) {
            clearTimeout(this.error.timeout);
        }

        this.error.timeout = setTimeout(() => {
            this.error.display = false;
        }, 3000);
    }
}
