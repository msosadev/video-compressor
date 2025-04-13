class PlayPauseButton extends HTMLButtonElement {
    connectedCallback() {
        this.video = this.closest("video-compressor").video;

        this.addEventListener('click', () => {
            if (this.video.paused || this.video.ended) {
                this.playVideo()
            } else {
                this.pauseVideo();
            }
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.disabled = false;
            this.playVideo()
        });
    }

    pauseVideo() {
        this.video.pause();
        this.textContent = 'Play';
    }

    playVideo() {
        this.video.play();
        this.textContent = 'Pause';
    }
}

class MuteButton extends HTMLButtonElement {
    connectedCallback() {
        this.video = this.closest("video-compressor").video;

        this.addEventListener('click', () => {
            if (this.video.muted) {
                this.unmuteVideo()
            } else {
                this.muteVideo();
            }
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.disabled = false;
        });
    }

    muteVideo() {
        this.video.muted = true;
        this.textContent = 'Unmute';
    }

    unmuteVideo() {
        this.video.muted = false;
        this.textContent = 'Mute';
    }
}

export { PlayPauseButton, MuteButton };