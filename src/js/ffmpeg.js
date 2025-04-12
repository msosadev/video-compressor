import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

class VideoCompressor extends HTMLElement {
    connectedCallback() {
        this.ffmpegLoaded = false;
        this.ffmpeg = new FFmpeg();
        this.baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        this.video = this.querySelector('video');
        this.fileInput = this.querySelector('input[type="file"]');
        this.sizeInput = this.querySelector("#file-size");
        this.inputMin = this.querySelector("#min-time");
        this.inputMax = this.querySelector("#max-time");
        this.message = this.querySelector('p');
        this.allowedFormats = ['mp4', 'webm'];
        this.outputFormat = 'output.mp4'
        this.loadingImg = this.querySelector('img');
        this.submitButton = this.querySelector("button");
        this.videoProgress = this.querySelector(".js-video-progress");

        this.loadFFmpeg();

        document.body.addEventListener("keydown", (e) => {
            if (e.key === "e") {
                const tick = document.createElement('option');
                tick.value = Math.floor((this.video.currentTime * Number(this.videoProgress.getAttribute("max"))) / this.video.duration);
                this.querySelector('#tickmarks').append(tick);
            };

            if (e.key === "v") {
                this.inputMin.value = this.video.currentTime;
            };

            if (e.key === "b") {
                this.inputMax.value = this.video.currentTime;
            };
        });

        this.fileInput.addEventListener('change', async (e) => {
            this.file = e.target.files[0];
            this.video.src = URL.createObjectURL(e.target.files[0]);
            this.filePromise = await fetchFile(e.target.files[0]);
        });

        this.video.addEventListener('loadedmetadata', () => this.videoProgress.max = this.video.duration);
        this.video.addEventListener('timeupdate', () => this.videoProgress.value = this.video.currentTime);
        this.videoProgress.addEventListener('input', () => this.video.currentTime = this.videoProgress.value);

        this.submitButton.addEventListener('click', () => {
            const format = this.file.type.split('/')[1];
            if (this.allowedFormats.includes(format) && this.inputMin.value && this.inputMax.value) {
                this.inputFormat = `input.${format}`;

                const startTime = parseFloat(this.inputMin.value);
                const endTime = parseFloat(this.inputMax.value);
                const duration = endTime - startTime;
                const targetSizeMB = Number(this.sizeInput.value);
                const audioBitrate = 64;
                const totalBitrate = (targetSizeMB * 8192) / duration;
                const videoBitrate = Math.max(totalBitrate - audioBitrate, 300); // Prevent too low

                const inputCut = "input-cut.mp4";

                this.ffmpegExecs = {
                    cutVideo: [
                        "-i", this.inputFormat,
                        "-ss", this.inputMin.value,
                        "-to", this.inputMax.value,
                        "-c", "copy",
                        inputCut
                    ],
                    compressToSize: [
                        "-i", inputCut,
                        "-c:v", "libx264",
                        "-b:v", `${Math.floor(videoBitrate)}k`,
                        "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac",
                        "-b:a", `${audioBitrate}k`,
                        this.outputFormat
                    ]
                }

                this.transcode();
            } else if (!this.allowedFormats.includes(format)) {
                this.message.innerText = 'Format not supported';
            } else if (!this.inputMin.value || !this.inputMax.value) {
                this.message.innerText = 'Start or end time not inserted';
            }
        })
    }

    loadFFmpeg = async () => {
        this.ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        this.ffmpeg.on("progress", ({ progress }) => {
            this.message.innerText = Math.trunc(progress * 100);
        });
        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.fileInput.disabled = false;
        this.ffmpegLoaded = true;
    }

    transcode = async () => {
        this.loadingImg.style.display = "block";
        await this.ffmpeg.writeFile(this.inputFormat, this.filePromise);
        await this.ffmpeg.exec(this.ffmpegExecs.cutVideo);
        await this.ffmpeg.exec(this.ffmpegExecs.compressToSize);
        const data = await this.ffmpeg.readFile(this.outputFormat);
        this.video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        this.loadingImg.style.display = "none";
    }
}

export default VideoCompressor;