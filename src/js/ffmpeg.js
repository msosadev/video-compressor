import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

let loaded = false;
const ffmpeg = new FFmpeg();
const videoElement = document.createElement("video");
videoElement.controls = true;
const buttonElement = document.createElement("button");
const messageElement = document.createElement("p");

class VideoCompressor extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        ffmpeg.on('log', ({ message }) => {
            messageElement.innerText = message;
            console.log(message);
        });
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        loaded = true;
        this.render();
    }

    transcode = async () => {
        await ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        videoElement.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }

    render = async () => {
        document.body.innerHTML = "";
        if (loaded) {
            buttonElement.innerText = "Transcode webm to mp4";
            buttonElement.onclick = this.transcode;
            document.body.appendChild(videoElement);
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(buttonElement);
            document.body.appendChild(messageElement);
            document.body.appendChild(document.createElement("p")).innerText = "Open Developer Tools (Ctrl+Shift+I) to View Logs";
        } else {
            buttonElement.innerText = "Load ffmpeg-core (~31 MB)";
            buttonElement.onclick = this.load;
            document.body.appendChild(buttonElement);
        }
    }
}

customElements.define('video-compressor', VideoCompressor);

