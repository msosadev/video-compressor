// import { FFmpeg } from '@ffmpeg/ffmpeg';

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import './App.css'
import VideoControls from "./components/VideoControls";
import { Package } from "feather-icons-react";

// import { fetchFile, toBlobURL } from '@ffmpeg/util';
function App() {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageRef = useRef<any>(null);

  const load = async () => {
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      messageRef.current.innerHTML = message;
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
  }

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
    await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
    const data: any = await ffmpeg.readFile('output.mp4');
    if (videoRef.current) videoRef.current.src =
      URL.createObjectURL(new Blob([(data.buffer)], { type: 'video/mp4' }));
  }

  useEffect(() => {
    load();
  }, [])

  return (
    <div>
      <VideoControls loaded={loaded} />
      <footer className="js-compress-controls">
        <div className="footer-row">
          <div className="file-size-input-wrapper">
            <input className="file-size-input" value="10" type="text" name="file-size" id="file-size" />
          </div>
          <button disabled={loaded ? false : true} className="js-compress-btn button wide-button">
            <span><Package size={20} /></span>
          </button>
        </div>
        <div className="progress-wrapper">
          <img className="hidden" src="./src/assets/cat-spinning.gif" alt="A spinning cat, you have to see it to believe it!" />
          <input is="audio-volume" value="0" type="range" id="audio-volume" name="audio-volume" min="0" max="100" />
          <audio loop><source src="./src/assets/the_cat_from_ipanema.mp3" type="audio/mpeg" /></audio>
          <p className="message hidden"></p>
        </div>
      </footer>
    </div>
  );
}

export default App
