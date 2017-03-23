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
#### Install FFmpeg
Edit `/etc/apt/sources.list`and add this line (for Raspberry Pi):
```bash
deb http://www.deb-multimedia.org jessie main non-free
```
or the appropriate line for your distribution [as listed here](http://www.deb-multimedia.org/).  
Then run the following `cmd`:
```bash
sudo apt-get update
sudo apt-get install deb-multimedia-keyring
sudo apt-get update
sudo apt-get install ffmpeg
```
#### Install CEC
Run the following `cmd`:
```bash
sudo apt-get install cec-utils
```
#### Install the project
Go to folder `interactive-board/webcam_device`, then run:
```bash
npm install
```
Create `interactive-board/webcam_device/webcam-secret.json`, open it and add your secret stream password, like so:
```bash
"secret"
```
#### Raspberry Pi setup
Install `uncluster` with the following `cmd`:
```bash
sudo apt-get install unclutter
```
Create `~/.config/autostart/autoChromium.desktop`, open it and add the following (edit the website):
```bash
[Desktop Entry]
Type=Application
Exec=/usr/bin/chromium-browser --incognito --noerrdialogs --disable-session-crashed-bubble --disable-infobars --kiosk http://www.website.com
Hidden=false
X-GNOME-Autostart-enabled=true
Name[en_US]=AutoChromium
Name=AutoChromium
Comment=Start Chromium at startup
```
Open `/etc/xdg/lxsession/LXDE/autostart`.  
Comment this line by adding `#` at the start, like so:
```bash
#@xscreensaver -no-splash
```
Add those lines to the file:
```bash
@xset s off
@xset -dpms
@xset s noblank
@unclutter -idle 0.1 -root
```
Open `/etc/lightdm/lightdm.conf`.  
Edit this line:
```bash
#xserver-command=X
```
in:
```bash
xserver-command=X -s 0 -dpms
```
Manually open Chromium at least once on desktop.  
Then reboot.

### Start webcam and TV handler
Run the following `cmd`:
```bash
node webcam-tv-handler.js
```
