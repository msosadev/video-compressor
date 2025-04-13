class PlayPauseButton extends HTMLButtonElement {
    connectedCallback() {
        this.video = this.closest("video-compressor").video;

        this.addEventListener('click', () => {
            if (this.disabled) return;

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
        console.log(this);

    }
}

export { PlayPauseButton, MuteButton };