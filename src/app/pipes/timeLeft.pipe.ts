import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeLeft'
})
export class TimeLeftPipe implements PipeTransform {
    transform(time: number): string {
        return (time < 60 ? time : Math.round(time / 60)).toString();
    }
}
