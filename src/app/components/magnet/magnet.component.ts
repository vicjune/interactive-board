import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { Constants } from './../../constants';

@Component({
    selector: 'magnet',
    templateUrl: './magnet.template.html',
    styleUrls: ['./magnet.style.css']
})
export class MagnetComponent implements OnInit {
    constructor (
        private FirebaseService: FirebaseService
    ) {}

    coordinates: number[] = [0, 0];
    mouseOffset: number[] = [0, 0];
    svg = {
        path: '',
        viewBox: ''
    };
    status = {
        drag: false,
        ready: false,
        loading: false
    };
    @Input() color: string;
    @Input() id: number;
    @Input() type: string;

    ngOnInit () {
        this.svg.path = Constants.SVG[this.type].PATH;
        this.svg.viewBox = Constants.SVG[this.type].VIEW_BOX.join(' ');

        this.FirebaseService.bindObject(this.id).subscribe(
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
        this.FirebaseService.setCoordinates(this.id, this.coordinates).subscribe(
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
