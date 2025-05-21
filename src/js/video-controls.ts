class PlayPauseButton extends HTMLButtonElement {
    video: HTMLVideoElement | null;

    constructor() {
        super();
        this.video = document.querySelector("video-compressor video");
    }
    
    connectedCallback() {
        this.addEventListener('click', () => {
            if (this.video?.paused || this.video?.ended) {
                this.playVideo()
            } else {
                this.pauseVideo();
            }
        });

        this.video?.addEventListener('loadedmetadata', () => {
            this.disabled = false;
            this.playVideo()
        });
    }

    pauseVideo() {
        this.video?.pause();
        this.classList.add("paused");
        this.classList.remove("playing");
    }

    playVideo() {
        this.video?.play();
        this.classList.remove("paused");
        this.classList.add("playing");
    }
}

class MuteButton extends HTMLButtonElement {
    video: HTMLVideoElement | null;

    constructor() {
        super();
        this.video = document.querySelector("video-compressor video");
    }
    connectedCallback() {
        if (!this.video) {
            console.error("Video element not found");
            return;
        }

        this.addEventListener('click', () => {
            if (this.video?.muted) {
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
        if (this.video) this.video.muted = true;
        this.classList.add("muted");
        this.classList.remove("unmuted");
    }

    unmuteVideo() {
        if (this.video) this.video.muted = false;
        this.classList.remove("muted");
        this.classList.add("unmuted");
    }
}

export { PlayPauseButton, MuteButton };