import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

class VideoCompressor extends HTMLElement {
    connectedCallback() {
        this.ffmpeg = new FFmpeg();
        this.baseURL = '/ffmpeg';
        this.video = this.querySelector('video');
        this.fileInput = this.querySelector('input[type="file"]');
        this.fileInputWrapper = this.querySelector(".file-input-floating");
        this.sizeInput = this.querySelector("#file-size");
        this.message = this.querySelector('p');
        this.allowedFormats = ['mp4', 'webm'];
        this.downloadName = "my-awesome-video"
        this.outputFormat = 'output.mp4'
        this.loadingImg = this.querySelector('img');
        this.submitButton = this.querySelector("button.js-compress-btn");
        this.videoProgress = this.querySelector(".js-video-progress");
        this.tickmarksWrapper = this.querySelector('#tickmarks');
        this.waitingAudio = this.querySelector("audio");
        this.downloadButton = this.querySelector('a.download-button');

        this.loadFFmpeg();

        document.body.addEventListener("keydown", (e) => {
            if (e.key === "e") {
                const tick = document.createElement('option');
                tick.value = Math.floor((this.video.currentTime * Number(this.videoProgress.getAttribute("max"))) / this.video.duration);
                if (this.tickmarksWrapper.children.length > 1) this.tickmarksWrapper.children[0].remove(); // Override previous tick
                if (this.tickmarksWrapper.children.length == 1) this.submitButton.disabled = false;
                this.tickmarksWrapper.append(tick);
            }
        });

        this.fileInput.addEventListener('change', async (e) => {
            this.file = e.target.files[0];
            this.video.src = URL.createObjectURL(e.target.files[0]);
            this.filePromise = await fetchFile(e.target.files[0]);
            this.fileInputWrapper.classList.add('hidden');
            this.fileInput.disabled = true;
        });

        // Video custom controls

        this.video.addEventListener('loadedmetadata', () => {
            this.videoProgress.max = this.video.duration;
            this.videoProgress.disabled = false;
        });

        this.video.addEventListener('timeupdate', () => this.videoProgress.value = this.video.currentTime);
        this.videoProgress.addEventListener('input', () => this.video.currentTime = this.videoProgress.value);

        // Video Compression

        this.submitButton.addEventListener('click', () => {
            const format = this.file.type.split('/')[1];

            if (this.allowedFormats.includes(format) && this.tickmarksWrapper.children.length === 2) {
                this.inputFormat = `input.${format}`;
                this.downloadName = this.file.name.replace(`.${format}`, "-compressed.mp4");

                const firstTick = parseFloat(this.tickmarksWrapper.children[0].value);
                const secondTick = parseFloat(this.tickmarksWrapper.children[1].value);

                const startTime = firstTick > secondTick ? secondTick : firstTick;
                const endTime = firstTick < secondTick ? secondTick : firstTick;
                const duration = endTime - startTime;
                const targetSizeMB = Number(this.sizeInput.value);
                const audioBitrate = 64;
                const totalBitrate = (targetSizeMB * 8192) / duration;
                const videoBitrate = Math.max(totalBitrate - audioBitrate, 300); // Prevent too low

                const inputCut = "input-cut.mp4";

                this.ffmpegExecs = {
                    cutVideo: [
                        "-i", this.inputFormat,
                        "-ss", String(startTime),
                        "-to", String(secondTick),
                        "-c", "copy",
                        inputCut
                    ],
                    compressToSize: [
                        "-i", inputCut,
                        "-c:v", "libx264",
                        "-b:v", `${Math.floor(videoBitrate)}k`,
                        "-preset", "superfast",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac",
                        "-b:a", `${audioBitrate}k`,
                        this.outputFormat
                    ]
                }
                console.log(this.ffmpegExecs);


                this.transcode();
            } else if (!this.allowedFormats.includes(format)) {
                this.message.classList.remove("hidden");
                this.message.innerText = 'Format not supported';
            } else if (this.tickmarksWrapper.children.length !== 2) {
                this.message.classList.remove("hidden");
                this.message.innerText = 'Start or end time not inserted';
            }
        })
    }

    loadFFmpeg = async () => {
        this.ffmpeg.on('log', ({ message }) => console.log(message));
        this.ffmpeg.on("progress", ({ progress }) => {
            this.message.classList.remove("hidden");
            this.message.innerText = Math.trunc(progress * 100)
        });
        this.ffmpeg.on('error', (err) => console.error('FFmpeg error:', err));

        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
        });
        
        this.fileInput.disabled = false;
        this.ffmpegLoaded = true;
    }

    setupDownload = () => {
        this.downloadButton.href = this.video.src;
        this.downloadButton.download = this.downloadName;
        this.downloadButton.classList.remove('disabled');
    }

    transcode = async () => {
        this.loadingImg.classList.remove("hidden");
        this.waitingAudio.play();
        await this.ffmpeg.writeFile(this.inputFormat, this.filePromise);
        await this.ffmpeg.exec(this.ffmpegExecs.cutVideo);
        await this.ffmpeg.exec(this.ffmpegExecs.compressToSize);
        const data = await this.ffmpeg.readFile(this.outputFormat);
        this.video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        this.setupDownload();
        this.waitingAudio.pause();
        this.loadingImg.classList.add("hidden");
    }
}

export default VideoCompressor;