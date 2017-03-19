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
    openHour = [];
    closeHour = [];
    openDays = [];
    @ViewChild('canvas') canvasRef: ElementRef;

    ngOnInit(): void {
        this.FirebaseService.bindServerIpObject().subscribe(ip => {
            if (this.jsmpegPlayer) {
                this.jsmpegPlayer.destroy();
            }
            this.jsmpegPlayer = new (<any>window).JSMpeg.Player('ws://' + ip.$value + '/', {canvas: this.canvasRef.nativeElement});

            if (!this.interval) {
                this.interval = setInterval(() => {

                    let now = new Date();
                    if (this.openDays.indexOf(now.getDay()) >= 0 && (this.openHour.length === 0 || this.hourInInterval(now))) {
                        this.openingHours = true;
                    } else {
                        this.openingHours = false;
                    }

                    this.checkOffline();
                    this.loading = false;

                }, 3000);
            }

        });

        let hoursFormatRegEx = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;
        this.FirebaseService.bindStreamHoursObject().subscribe(streamHours => {
            this.openHour = [];
            this.closeHour = [];
            this.openDays = [];
            if (hoursFormatRegEx.test(streamHours.open) && hoursFormatRegEx.test(streamHours.close)) {
                this.openHour = [parseInt(streamHours.open.split(':')[0]), parseInt(streamHours.open.split(':')[1])];
                this.closeHour = [parseInt(streamHours.close.split(':')[0]), parseInt(streamHours.close.split(':')[1])];
            }

            for (var day in streamHours.daysOpen) {
                if (streamHours.daysOpen.hasOwnProperty(day) && streamHours.daysOpen[day]) {
                    switch(day) {
                        case 'monday':
                            this.openDays.push(1);
                            break;
                        case 'tuesday':
                            this.openDays.push(2);
                            break;
                        case 'wednesday':
                            this.openDays.push(3);
                            break;
                        case 'thursday':
                            this.openDays.push(4);
                            break;
                        case 'friday':
                            this.openDays.push(5);
                            break;
                        case 'saturday':
                            this.openDays.push(6);
                            break;
                        case 'sunday':
                            this.openDays.push(0);
                            break;
                    }
                }
            }
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

    private hourInInterval(now: Date): boolean {
        return (now.getHours() > this.openHour[0] && now.getHours() < this.closeHour[0]) || (now.getHours() === this.openHour[0] && now.getMinutes() >= this.openHour[1]) || (now.getHours() === this.closeHour[0] && now.getMinutes() < this.closeHour[1])
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
