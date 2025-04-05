import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

class VideoCompressor extends HTMLElement {
    connectedCallback() {
        this.ffmpegLoaded = false;
        this.ffmpeg = new FFmpeg();
        this.baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        this.video = this.querySelector('video');
        this.fileInput = this.querySelector('input[type="file"]');
        this.inputMin = this.querySelector("#min-time");
        this.inputMax = this.querySelector("#max-time");
        this.message = this.querySelector('p');
        this.allowedFormats = ['mp4', 'webm'];
        this.outputFormat = 'output.mp4'
        console.log(this.inputMin, this.inputMax);
        

        this.loadFFmpeg();

        this.fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            const promise = await fetchFile(e.target.files[0]);
            const format = file.type.split('/')[1];
            if (this.allowedFormats.includes(format)) {
                this.inputFormat = `input.${format}`;
                this.ffmpegExecs = {
                    webmToMp4: ['-i', this.inputFormat, this.outputFormat],
                    changeCodec: ['-i', this.inputFormat, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', this.outputFormat],
                    codecAndCut: ['-i', this.inputFormat, "-ss", this.inputMin.value, "-to", this.inputMax.value, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', this.outputFormat],
                    cutVideo: ["-i", this.inputFormat, "-ss", this.inputMin.value, "-to", this.inputMax.value, "-c", "copy", this.outputFormat]
                }
                console.log(this.ffmpegExecs.cutVideo);
                
                this.transcode(promise);
            } else {
                this.message.innerText = 'Format not supported';
            }
        });
    }

    loadFFmpeg = async () => {
        this.ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        this.ffmpeg.on("progress", ({ progress }) => {
            this.message.innerText = Math.trunc(progress*100);
        });
        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.fileInput.disabled = false;
        this.ffmpegLoaded = true;
    }

    transcode = async (promise) => {
        await this.ffmpeg.writeFile(this.inputFormat, promise);
        await this.ffmpeg.exec(this.ffmpegExecs.codecAndCut);
        const data = await this.ffmpeg.readFile(this.outputFormat);
        this.video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }
}

customElements.define('video-compressor', VideoCompressor);

