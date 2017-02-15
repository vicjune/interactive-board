import { Component, OnInit } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';

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

    error = {
        display: false,
        message: '',
        timeout: null
    }

    ngOnInit() {
        this.ErrorService.output().subscribe(
            message => this.handleError(message)
        );
    }

    handleError(message: string) {
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
