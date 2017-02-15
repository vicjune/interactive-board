import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ErrorService {
    private subject = new ReplaySubject<string>(1);

    input(errorMessage = '', error = null) {
        let message = 'An error occured, sorry :/';
        if (errorMessage === 'connection') {
            message = 'Oops! A connection issue occured :/';
        }
        if (errorMessage === 'letter-selected') {
            message = 'You already voted for a letter, wait for the next turn';
        }
        if (errorMessage === 'letter-voted') {
            message = 'This letter has already been voted for in this turn';
        }
        if (error) {
            console.error(error);
        }
        this.subject.next(message);
    }

    output() {
        return this.subject.asObservable();
    }
}
