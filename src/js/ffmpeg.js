import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

class VideoCompressor extends HTMLElement {
    connectedCallback() {
        this.ffmpegLoaded = false;
        this.ffmpeg = new FFmpeg();
        this.baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        this.video = this.querySelector('video');
        this.input = this.querySelector('input');
        this.message = this.querySelector('p');

        this.loadFFmpeg();

        this.input.addEventListener('change', async (e) => {
            const promise = await fetchFile(e.target.files[0]);
            this.transcode(promise);
        });
    }

    loadFFmpeg = async () => {
        this.ffmpeg.on('log', ({ message }) => {
            this.message.innerText = message;
            console.log(message);
        });
        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${this.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.ffmpegLoaded = true;
    }

    transcode = async (promise) => {
        await this.ffmpeg.writeFile('input.webm', promise);
        await this.ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data = await this.ffmpeg.readFile('output.mp4');
        this.video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }
}

customElements.define('video-compressor', VideoCompressor);

