# InteractiveBoard

## Client
### Installation
Go to folder `interactive-board/client`, then run:
```bash
npm install
```
If Angular CLI is not installed:
```
npm install -g @angular/cli
```
### Development
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `interactive-board/client/dist/` directory. Use the `-prod` flag for a production build.

## Firebase Server
### Installation
Go to folder `interactive-board/firebase_server`, then run:
```bash
npm install
```
Add Service Account from Google as `interactive-board/firebase_server/interactive-board-account.json`.

### Run server
Run the following `cmd`:
```bash
node server.js
```

## Webcam Server
### Installation
Go to folder `interactive-board/webcam_server`, then run:
```bash
npm install
```
Create `interactive-board/webcam_server/webcam-secret.json`, open it and add your secret stream password, like so:
```bash
"secret"
```

### Run server
Run the following `cmd`:
```bash
node webcam-server.js
```

## Webcam Device
### Installation
Install `ffmpeg`.  
Install `cec` with command:
```bash
sudo apt-get install cec-utils
```

Go to folder `interactive-board/webcam_device`, then run:
```bash
npm install
```
Create `interactive-board/webcam_device/webcam-secret.json`, open it and add your secret stream password, like so:
```bash
"secret"
```

### Start webcam and TV handler
Run the following `cmd`:
```bash
node webcam-tv-handler.js
```
