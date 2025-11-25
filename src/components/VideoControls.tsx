import { fetchFile } from "@ffmpeg/util";
import { useState } from "react";

const VideoControls = (props: any) => {
    const { loaded } = props;
    const [videoSrc, setVideoSrc] = useState<any>(null);

    const onFileLoad = async (e: any) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setVideoSrc(URL.createObjectURL(file))
        await fetchFile(file);
    }

    return (
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
                    <button disabled={loaded ? false : true} className="button paused">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></span>
                    </button>

                    <a href="#" className="disabled download-button button">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span>
                    </a>
                </div>
                <div className="volume-wrapper">
                    <button disabled={loaded ? false : true} className="button muted">
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-volume"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>
                        <span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg></span>
                    </button>
                    <div>
                        <input disabled={loaded ? false : true} className="js-video-volume" value="0" type="range" id="video-volume" name="video-volume" min="0" max="100" />
                    </div>
                </div>
            </div>
            <div className="js-progress-container">
                <input disabled={loaded ? false : true} className="js-video-progress" value="0" type="range" id="video-progress" name="video-progress" list="tickmarks" min="0" max="1000" />
                <datalist id="tickmarks">
                </datalist>
            </div>
        </main>
    )
}

export default VideoControls;