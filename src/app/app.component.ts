import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('video')
  public video: ElementRef;

  selectedVideoDevice: string;
  selectedAudioDevice: string;

  showText: boolean;
  showError: boolean;
  canJoinMeeting: boolean;
  errorMessage: string;

  availableVideoDevices: Array<{deviceId: string, name: string}>;
  availableAudioDevices: Array<{deviceId: string, name: string}>;

  public ngOnInit() {
    this.showText = false;
    this.showError = false;
    this.canJoinMeeting = true;
    this.availableVideoDevices = [];
    this.availableAudioDevices = [];
    this.selectedVideoDevice = undefined;
    this.selectedAudioDevice = undefined;
    this.detectDevices();
  }

  private detectDevices() {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        devices.forEach( device => {
          if (device.kind === 'audioinput') {
            if (!this.selectedAudioDevice) {
              this.selectedAudioDevice = device.deviceId;
            }
            this.availableAudioDevices.push({
              deviceId: device.deviceId,
              name: device.label || `microphone ${this.availableAudioDevices.length + 1}`
            });
          } else if (device.kind === 'videoinput') {
            if (!this.selectedVideoDevice) {
              this.selectedVideoDevice = device.deviceId;
            }
            this.availableVideoDevices.push({
              deviceId: device.deviceId,
              name: device.label || `camera ${this.availableVideoDevices.length + 1}`
            });
          }
      });
    })
    .catch(error => this.handleError(error));
  }

  onStart() {
    this.startMeeting();
  }

  onVideoDeviceChange(videoDevice) {
    this.selectedVideoDevice = videoDevice;
    this.canJoinMeeting = true;
  }
  onAudioDeviceChange(audioDevice) {
    this.selectedAudioDevice = audioDevice;
    this.canJoinMeeting = true;
  }

  startMeeting() {
    this.showError = false;
    const audioSource = this.selectedAudioDevice;
    const videoSource = this.selectedVideoDevice;
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.muted = true;
        this.video.nativeElement.play();
        this.showText = true;
        this.canJoinMeeting = false;
      })
      .catch(error => this.handleError(error));
    }
  }

  private handleError(error) {
    this.showError = true;
    this.errorMessage = error.toString();
  }
}
