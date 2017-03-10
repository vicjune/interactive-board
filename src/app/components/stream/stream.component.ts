import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
let JSMpeg = (<any>window).JSMpeg;

import { ErrorService } from './../../services/error.service';

@Component({
    moduleId: module.id,
    selector: 'stream',
    templateUrl: 'stream.template.html',
    styleUrls: ['stream.style.css']
})
export class StreamComponent implements OnInit {
    constructor(
        private ErrorService: ErrorService
    ) {}

    @ViewChild('canvas') canvasRef: ElementRef;

    ngOnInit(): void {
        let url = 'ws://192.168.1.138:8082/';

        new JSMpeg.Player(url, {canvas: this.canvasRef.nativeElement});
    }
}
