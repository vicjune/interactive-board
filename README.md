# InteractiveBoard

## Client
### Installation
Run the following `cmd`:
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
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Firebase Server
### Installation
Run the following `cmd`:
```bash
npm install
```
Add Service Account from Google as `server/interactive-board-account.json`.

### Run server
Run the following `cmd`:
```bash
node server/server.js
```

## Webcam Server
### Installation
Run the following `cmd`:
```bash
npm install
```
Create `server/websocket-secret.json`, open it and add your secret stream password, like so:
```bash
"secret"
```

### Run server
Run the following `cmd`:
```bash
node server/websocket-relay.js
```

## Webcam Source
### Installation
Install `ffmpeg`.  

Run the following `cmd`:
```bash
chmod +x server/webcam.sh
chmod +x server/webcam_stop.sh
```
Create `server/webcam_serverIp.txt`, open it and add the Webcam Server ip followed by your secret stream password, like so:
```bash
http://127.0.0.1:8081/secret
```

### Start webcam stream
Run the following `cmd`:
```bash
./server/webcam.sh
```

### Stop webcam stream
Run the following `cmd`:
```bash
./server/webcam_stop.sh
```
