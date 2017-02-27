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
    loading: boolean = true;
    animation = {
        animate: false,
        coordinates: {
            x: 0,
            y: 0
        },
        height: 0,
        width: 0,
        magnet: null
    }
    @ViewChild('board') board: ElementRef;

    ngOnInit(): void {
        this.buildRectangle();

        this.FirebaseService.bindMagnetList().subscribe(
            firebaseList => {
                for (let firebaseMagnet of firebaseList) {
                    if (this.magnets.every( magnet => firebaseMagnet.$key !== magnet.id)) {
                        this.magnets.push({
                            id: firebaseMagnet.$key,
                            color: firebaseMagnet.color,
                            type: firebaseMagnet.type
                        })
                    }
                }
                if (firebaseList.length < this.magnets.length) {
                    for (let i = 0; i < this.magnets.length; ++i) {
                        let isPresent = false;
                        for (let firebaseMagnet of firebaseList) {
                            if (this.magnets[i].id === firebaseMagnet.$key) {
                                isPresent = true;
                            }
                        }
                        if (!isPresent) {
                            this.magnets.splice(i, 1);
                        }
                    }
                }
            },
            error => this.ErrorService.input('connection', error)
        );
    }

    onResize(): void {
        this.buildRectangle();
    }

    onLoaded(): void {
        this.loading = false;
    }

    animateDestroy(data): void {
        this.animation.animate = true;
        this.animation.coordinates = {
            x: data.x,
            y: data.y
        }
        this.animation.magnet = data.magnet;
        this.animation.width = data.width;
        this.animation.height = data.height;
        setTimeout(() => {
            this.animation.animate = false;
        }, 1000);
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
