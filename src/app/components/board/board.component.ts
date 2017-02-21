import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';
import { Magnet } from './../../interfaces/magnet';
import { Rectangle } from './../../interfaces/rectangle';

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
    rectangle: Rectangle;
    @ViewChild('board') board: ElementRef;

    ngOnInit(): void {
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

    onResize(): void {
        this.buildRectangle();
    }

    catchEvent(e: MouseEvent): void {
        this.event = e;
    }

    private buildRectangle(): void {
        let bouncingRect = this.board.nativeElement.getBoundingClientRect();
        this.rectangle = {
            top: bouncingRect.top + window.scrollY,
            bottom: bouncingRect.bottom + window.scrollY,
            left: bouncingRect.left + window.scrollX,
            right: bouncingRect.right + window.scrollX,
        }
    }
}
