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
Create `interactive-board/websocket_server/webcam-secret.json`, open it and add your secret stream password, like so:
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

Go to folder `interactive-board/webcam_device`, then run:
```bash
chmod +x server/webcam.sh
chmod +x server/webcam_stop.sh
```
Create `interactive-board/webcam_device/webcam_serverIp.txt`, open it and add the Webcam Server ip followed by your secret stream password, like so:
```bash
http://127.0.0.1:8081/secret
```

### Start webcam stream
Run the following `cmd`:
```bash
./webcam.sh
```

### Stop webcam stream
Run the following `cmd`:
```bash
./webcam_stop.sh
```
