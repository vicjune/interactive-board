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
    @Input() private id: number;

    ngOnInit () {
        this.FirebaseService.bindObject(this.id).subscribe(
            firebaseObject => {
                this.updateCoordinates(firebaseObject);
            },
            error => console.error(error),
            () => {}
        );
    }

    private updateCoordinates(firebaseObject: any) {
        this.coordinates[0] = firebaseObject.x;
        this.coordinates[1] = firebaseObject.y;
    }

    private sendCoordinates() {
        this.FirebaseService.setCoordinates(this.id, this.coordinates).subscribe(
            null,
            error => console.error(error),
            () => {
                console.log('ok');
            }
        );
    }
}
