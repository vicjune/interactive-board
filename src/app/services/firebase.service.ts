import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';

@Injectable()
export class FirebaseService {
    constructor (private af: AngularFire) {}

    bindStatusObject(): FirebaseObjectObservable<any>{
        return this.af.database.object('/status');
    }

    bindDyingMagnetsObject(): FirebaseObjectObservable<any>{
        return this.af.database.object('/dyingMagnets');
    }

    bindMagnetList(): FirebaseListObservable<any>{
        return this.af.database.list('/magnets');
    }

    bindMagnetObject(id: string): FirebaseObjectObservable<any>{
        return this.af.database.object('/magnets/' + id);
    }

    setCoordinates(id: string, coordinates: number[]) {
        return this.bindMagnetObject(id).update({
            x: coordinates[0],
            y: coordinates[1]
        });
    }

    bindLettersObject(): FirebaseObjectObservable<any> {
        return this.af.database.object('/letters');
    }

    setLetter(type: string) {
        return this.af.database.object('/letters/' + type).set(true);
    }
}
