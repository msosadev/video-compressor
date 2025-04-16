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
        this.classList.add("paused");
        this.classList.remove("playing");
    }

    playVideo() {
        this.video.play();
        this.classList.remove("paused");
        this.classList.add("playing");
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
        this.classList.add("muted");
        this.classList.remove("unmuted");
    }

    unmuteVideo() {
        this.video.muted = false;
        this.classList.remove("muted");
        this.classList.add("unmuted");
    }
}

export { PlayPauseButton, MuteButton };