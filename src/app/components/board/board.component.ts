import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { Magnet } from './../../classes/magnet';

@Component({
    selector: 'board',
    templateUrl: './board.template.html',
    styleUrls: ['./board.style.css']
})
export class BoardComponent implements OnInit {
    constructor(
        private FirebaseService: FirebaseService
    ) {}
    event: MouseEvent;
    magnets: Magnet[] = [];
    rectangle;
    @ViewChild('board') board;

    ngOnInit() {
        // TODO SERVER SIDE
        // this.FirebaseService.addMagnet('I', 'purple').subscribe(
        //     null,
        //     error => {
        //         console.error(error);
        //     },
        //     () => {
        //         console.log('ok');
        //     }
        // );

        this.buildRectangle();

        this.FirebaseService.bindList().subscribe(
            firebaseList => {
                this.magnets = firebaseList.map((item) => {
                    return {
                        id: item.$key,
                        color: item.color,
                        type: item.type
                    }
                });
            },
            error => console.error(error)
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
