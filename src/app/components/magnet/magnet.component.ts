import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service'

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
    status = {
        drag: false,
        ready: false
    };
    @Input() color: string;
    @Input() id: number;


    ngOnInit () {
        this.FirebaseService.bindObject(this.id).subscribe(
            firebaseObject => {
                this.updateCoordinates(firebaseObject);
                this.status.ready = true;
            },
            error => console.error(error)
        );
    }

    mouseDown(e) {
        this.status.drag = true;
        this.mouseOffset = [e.layerX, e.layerY];
        this.coordinates = [e.clientX - e.layerX, e.clientY - e.layerY];
    }

    mouseMove(e) {
        if (this.status.drag) {
            this.coordinates = [e.clientX - this.mouseOffset[0], e.clientY - this.mouseOffset[1]];
        }
    }

    mouseUp() {
        if (this.status.drag) {
            this.sendCoordinates();
        }
    }

    private updateCoordinates(firebaseObject: any) {
        if (!this.status.drag) {
            this.coordinates[0] = firebaseObject.x;
            this.coordinates[1] = firebaseObject.y;
        }
    }

    private sendCoordinates() {
        this.FirebaseService.setCoordinates(this.id, this.coordinates).subscribe(
            null,
            error => {
                console.error(error);
                this.status.drag = false;
            },
            () => {
                this.status.drag = false;
            }
        );
    }
}
