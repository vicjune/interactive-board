import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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

    serverUrl: string;
    jsmpegPlayer: any;
    @ViewChild('canvas') canvasRef: ElementRef;

    ngOnInit(): void {
        this.serverUrl = 'ws://192.168.1.138:8082/';
        this.jsmpegPlayer = new (<any>window).JSMpeg.Player(this.serverUrl, {canvas: this.canvasRef.nativeElement});
    }
}
