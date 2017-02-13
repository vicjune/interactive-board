import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { Magnet } from './../../classes/magnet';
import { Constants } from './../../constants';

@Component({
    selector: 'magnet',
    templateUrl: './magnet.template.html',
    styleUrls: ['./magnet.style.css']
})
export class MagnetComponent implements OnInit, OnChanges {
    constructor (
        private FirebaseService: FirebaseService
    ) {}

    coordinates: number[] = [0, 0];
    mouseOffset: number[] = [0, 0];
    svg = {
        path: '',
        viewBox: '',
        width: 0,
        height: 0
    };
    status = {
        drag: false,
        ready: false,
        loading: false
    };
    @Input() magnet: Magnet;
    @Input() eventCatched: MouseEvent;

    ngOnChanges(changes) {
        if (changes.eventCatched && changes.eventCatched.currentValue !== undefined) {
            let eventType = changes.eventCatched.currentValue.type;
            if (eventType === 'mousemove') {
                this.mouseMove(changes.eventCatched.currentValue);
            }
            if (eventType === 'mouseleave' || eventType === 'mouseup') {
                this.mouseUp();
            }
        }
    }

    ngOnInit() {
        this.svg.path = Constants.SVG[this.magnet.type].PATH;
        this.svg.viewBox = Math.floor(Constants.SVG[this.magnet.type].VIEW_BOX[0] * -0.1 + 1) + ' ' + Math.floor(Constants.SVG[this.magnet.type].VIEW_BOX[1] * -0.1 + 1) + ' ' + Constants.SVG[this.magnet.type].VIEW_BOX.join(' ');
        this.svg.width = Constants.SVG[this.magnet.type].WIDTH ? Constants.SVG[this.magnet.type].WIDTH : Constants.SVG[this.magnet.type].VIEW_BOX[0];
        this.svg.height = Constants.SVG[this.magnet.type].HEIGHT ? Constants.SVG[this.magnet.type].HEIGHT : Constants.SVG[this.magnet.type].VIEW_BOX[1];

        this.FirebaseService.bindObject(this.magnet.id).subscribe(
            firebaseObject => {
                this.updateCoordinates(firebaseObject);
                this.status.ready = true;
            },
            error => console.error(error)
        );
    }

    mouseDown(e) {
        if (!this.status.drag && !this.status.loading) {
            this.status.drag = true;
            this.mouseOffset = [e.layerX, e.layerY];
            this.coordinates = [e.clientX - e.layerX, e.clientY - e.layerY];
        }
    }

    mouseMove(e) {
        if (this.status.drag) {
            this.coordinates = [e.clientX - this.mouseOffset[0], e.clientY - this.mouseOffset[1]];
        }
    }

    mouseUp() {
        if (this.status.drag) {
            this.status.drag = false;
            this.sendCoordinates();
        }
    }

    private updateCoordinates(firebaseObject: any) {
        if (!this.status.drag && !this.status.loading) {
            this.coordinates[0] = firebaseObject.x;
            this.coordinates[1] = firebaseObject.y;
        }
    }

    private sendCoordinates() {
        this.status.loading = true;
        this.FirebaseService.setCoordinates(this.magnet.id, this.coordinates).subscribe(
            null,
            error => {
                console.error(error);
                this.status.loading = false;
            },
            () => {
                this.status.loading = false;
            }
        );
    }
}
