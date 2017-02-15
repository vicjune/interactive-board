import { Component, OnInit, ViewChild } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';
import { Magnet } from './../../classes/magnet';

@Component({
    selector: 'board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.css']
})
export class BoardComponent implements OnInit {
    constructor(
        private FirebaseService: FirebaseService,
        private ErrorService: ErrorService
    ) {}
    event: MouseEvent;
    magnets: Magnet[] = [];
    rectangle;
    @ViewChild('board') board;

    ngOnInit() {
        this.buildRectangle();

        this.FirebaseService.bindMagnetList().subscribe(
            firebaseList => {
                this.magnets = firebaseList.map((item) => {
                    return {
                        id: item.$key,
                        color: item.color,
                        type: item.type
                    }
                });
            },
            error => this.ErrorService.input('connection', error)
        );
    }

    onResize() {
        this.buildRectangle();
    }

    catchEvent = function(e) {
        this.event = e;
    }

    private buildRectangle() {
        let bouncingRect = this.board.nativeElement.getBoundingClientRect();
        this.rectangle = {
            top: bouncingRect.top + window.scrollY,
            bottom: bouncingRect.bottom + window.scrollY,
            left: bouncingRect.left + window.scrollX,
            right: bouncingRect.right + window.scrollX,
        }
    }
}
