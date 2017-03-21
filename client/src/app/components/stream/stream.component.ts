import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { ErrorService } from './../../services/error.service';
import { FirebaseService } from './../../services/firebase.service';

@Component({
    moduleId: module.id,
    selector: 'stream',
    templateUrl: 'stream.template.html',
    styleUrls: ['stream.style.css']
})
export class StreamComponent implements OnInit, OnDestroy {
    constructor(
        private ErrorService: ErrorService,
        private FirebaseService: FirebaseService
    ) {}

    serverUrl: string;
    jsmpegPlayer: any;
    interval: any = false;
    offline: boolean = false;
    loading: boolean = true;
    oldTime: number = 0;
    openingHours: boolean = false;
    @ViewChild('canvas') canvasRef: ElementRef;

    ngOnInit(): void {
        this.FirebaseService.bindServerObject().subscribe(server => {
            if (this.jsmpegPlayer) {
                this.jsmpegPlayer.destroy();
            }

            this.jsmpegPlayer = new (<any>window).JSMpeg.Player('ws://' + server.ip + ':' + server.websocketPort + '/', {canvas: this.canvasRef.nativeElement});

            if (!this.interval) {
                this.interval = setInterval(() => {
                    this.checkOffline();
                    this.loading = false;
                }, 3000);
            }
        });

        this.FirebaseService.bindStreamOpenObject().subscribe(streamOpen => {
            this.openingHours = streamOpen.$value === true ? true : false;
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

    private checkOffline(): void{
        if (this.jsmpegPlayer.currentTime === this.oldTime) {
            this.offline = true;
        } else {
            this.oldTime = this.jsmpegPlayer.currentTime;
            this.offline = false;
        }
    }
}
