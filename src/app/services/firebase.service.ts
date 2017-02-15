import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';

@Injectable()
export class FirebaseService {
    constructor (private af: AngularFire) {}

    bindMagnetList(): FirebaseListObservable<any>{
        return this.af.database.list('/magnets');
    }

    bindMagnetObject(id: string): FirebaseObjectObservable<any>{
        return this.af.database.object('/magnets/' + id);
    }

    setCoordinates(id: string, coordinates: number[]) {
        return this.bindMagnetObject(id).update({
            x: coordinates[0],
            y: coordinates[1],
            timestamp: + new Date
        });
    }

    // TODO SERVER SIDE
    // addMagnet(type: string, color: string) {
    //     return this.bindMagnetList().push({
    //         type: type,
    //         color: color
    //     });
    // }
}
