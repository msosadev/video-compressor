// import { FFmpeg } from '@ffmpeg/ffmpeg';

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import './App.css'

// import { fetchFile, toBlobURL } from '@ffmpeg/util';
function App() {
  const [loaded, setLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState<any>(null);
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

  const onFileLoad = async (e: any) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setVideoSrc(URL.createObjectURL(file))
    await fetchFile(file);
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <main className="video-wrapper">
        <div className="video-container">
          <div hidden={videoSrc ? true : false} className="file-input-floating">
            <input onChange={onFileLoad} hidden={true} id="file-input" disabled={loaded ? false : true} type="file" />
            <label htmlFor="file-input" className="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file-plus"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            </label>
          </div>
          <video src={videoSrc} muted autoPlay></video>
        </div>
        <div className="js-video-controls">
          <div className="buttons-wrapper">
            <button is="play-pause-button" disabled={loaded ? false : true} className="button paused">
              <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>
              <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></span>
            </button>

            <a href="#" className="disabled download-button button">
              <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span>
            </a>
          </div>
          <div className="volume-wrapper">
            <button is="mute-button" disabled={loaded ? false : true} className="button muted">
              <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-volume"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>
              <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg></span>
            </button>
            <div>
              <input is="video-volume" disabled={loaded ? false : true} className="js-video-volume" value="0" type="range" id="video-volume" name="video-volume" min="0" max="100" />
            </div>
          </div>
        </div>
        <div className="js-progress-container">
          <input disabled={loaded ? false : true} className="js-video-progress" value="0" type="range" id="video-progress" name="video-progress" list="tickmarks" min="0" max="1000" />
          <datalist id="tickmarks">
          </datalist>
        </div>
      </main>
      <footer className="js-compress-controls">
        <div className="footer-row">
          <div className="file-size-input-wrapper">
            <input className="file-size-input" value="10" type="text" name="file-size" id="file-size" />
          </div>
          <button disabled={loaded ? false : true} className="js-compress-btn button wide-button">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-package"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></span>
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
