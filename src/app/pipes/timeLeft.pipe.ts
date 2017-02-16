import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeLeft'
})
export class TimeLeftPipe implements PipeTransform {
    transform(time: number): string {
        return time < 60 ? time + ' sec' : Math.floor(time / 60) + ' min';
    }
}
