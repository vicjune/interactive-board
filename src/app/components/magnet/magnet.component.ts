import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';

import { FirebaseService } from './../../services/firebase.service';
import { ErrorService } from './../../services/error.service';
import { Magnet } from './../../interfaces/magnet';
import { Rectangle } from './../../interfaces/rectangle';
import { Constants } from './../../constants';

@Component({
    selector: 'magnet',
    templateUrl: './magnet.template.html',
    styleUrls: ['./magnet.style.css']
})
export class MagnetComponent implements OnInit, OnDestroy {
    constructor(
        private FirebaseService: FirebaseService,
        private ErrorService: ErrorService
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
        hidden: true,
        loading: false,
        animation: false,
        dying: false
    };
    @Input() magnet: Magnet;
    @Input() board: Rectangle;
    @Input() animationCoordinates;
    @Output() destroy = new EventEmitter();
    @Output() ready = new EventEmitter();

    private subscription;

    ngOnInit() {
        this.svg.path = Constants.SVG[this.magnet.type].PATH;
        this.svg.viewBox = Math.floor(Constants.SVG[this.magnet.type].VIEW_BOX[0] * -0.1 + 1) + ' ' + Math.floor(Constants.SVG[this.magnet.type].VIEW_BOX[1] * -0.1 + 1) + ' ' + Constants.SVG[this.magnet.type].VIEW_BOX.join(' ');
        this.svg.width = Constants.SVG[this.magnet.type].WIDTH ? Constants.SVG[this.magnet.type].WIDTH/10 : Constants.SVG[this.magnet.type].VIEW_BOX[0]/10;
        this.svg.height = Constants.SVG[this.magnet.type].HEIGHT ? Constants.SVG[this.magnet.type].HEIGHT/10 : Constants.SVG[this.magnet.type].VIEW_BOX[1]/10;

        if (this.animationCoordinates) {
            this.updateCoordinates(this.animationCoordinates);
            this.status.ready = true;
            this.status.animation = true;
            this.status.hidden = false;
        } else {
            this.subscription = this.FirebaseService.bindMagnetObject(this.magnet.id).subscribe(
                firebaseObject => {
                    if (firebaseObject.$exists()) {
                        this.updateCoordinates(firebaseObject);
                        this.status.dying = firebaseObject.dying ? firebaseObject.dying : false;
                        this.status.ready = true;
                        setTimeout(() => {
                            this.ready.emit();
                            this.status.hidden = false;
                        });
                    }
                },
                error => this.ErrorService.input('connection', error)
            );
        }
    }

    ngOnDestroy() {
        if (!this.animationCoordinates) {
            this.destroy.emit({
                x: this.coordinates[0],
                y: this.coordinates[1],
                height: this.svg.height,
                width: this.svg.width,
                magnet: this.magnet
            });
            this.subscription.unsubscribe();
        }
    }

    mouseDown(e) {
        if (!this.status.drag && !this.status.loading && !this.status.animation) {
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
            this.coordinates[0] = firebaseObject.x ? firebaseObject.x : 90;
            this.coordinates[1] = firebaseObject.y ? firebaseObject.y : 90;
        }
    }

    private sendCoordinates() {
        this.status.loading = true;
        this.FirebaseService.setCoordinates(this.magnet.id, this.coordinates)
        .then( () => {
            this.status.loading = false;
        }).catch( error => {
            this.status.loading = false;
            this.ErrorService.input('connection', error);
        });
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
