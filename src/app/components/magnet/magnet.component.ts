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
    @Input() board;
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
        this.svg.width = Constants.SVG[this.magnet.type].WIDTH ? Constants.SVG[this.magnet.type].WIDTH/10 : Constants.SVG[this.magnet.type].VIEW_BOX[0]/10;
        this.svg.height = Constants.SVG[this.magnet.type].HEIGHT ? Constants.SVG[this.magnet.type].HEIGHT/10 : Constants.SVG[this.magnet.type].VIEW_BOX[1]/10;

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
            this.mouseOffset = [e.offsetX, e.offsetY];
            this.coordinates = [this.toPercentage(e.pageX - e.offsetX - this.board.left, 'x'), this.toPercentage(e.pageY - e.offsetY - this.board.top, 'y')];
        }
    }

    mouseMove(e) {
        if (this.status.drag) {
            let x = this.toPercentage(e.pageX - this.mouseOffset[0] - this.board.left, 'x');
            let y = this.toPercentage(e.pageY - this.mouseOffset[1] - this.board.top, 'y');
            if (x > 0 && x + this.svg.width < 100 && y > 0 && y + this.svg.height < 100) {
                this.coordinates = [x, y];
            }
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

    private toPercentage(value: number, direction: string): number {
        if (direction === 'x') {
            return value * 100 / (this.board.right - this.board.left);
        } else if (direction === 'y') {
            return value * 100 / (this.board.bottom - this.board.top);
        } else {
            return value;
        }
    }
}
