import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ErrorService {
    private subject = new ReplaySubject<string>(1);

    input(error, errorMessage = '') {
        let message = 'An error occured, sorry :/';
        if (errorMessage === 'connection') {
            message = 'Oops! A connection issue occured :/';
        }
        console.error(error);
        this.subject.next(message);
    }

    output() {
        return this.subject.asObservable();
    }
}
