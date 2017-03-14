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
    @ViewChild('canvas') canvasRef: ElementRef;

    ngOnInit(): void {
        this.FirebaseService.bindServerIpObject().subscribe(ip => {
            if (this.jsmpegPlayer) {
                this.jsmpegPlayer.destroy();
            }
            this.jsmpegPlayer = new (<any>window).JSMpeg.Player('ws://' + ip.$value + '/', {canvas: this.canvasRef.nativeElement});

            if (!this.interval) {
                this.interval = setInterval(() => {
                    this.checkOffline();
                }, 1000);
            }

            this.loading = false;
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
