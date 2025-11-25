import { fetchFile } from "@ffmpeg/util";
import { Download, FilePlus, Pause, Play, Volume, VolumeX } from "feather-icons-react";
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
                        <FilePlus size={20} />
                    </label>
                </div>
                <video src={videoSrc} muted autoPlay></video>
            </div>
            <div className="js-video-controls">
                <div className="buttons-wrapper">
                    <button disabled={loaded ? false : true} className="button paused">
                        <Play size={20}/>
                        <Pause size={20}/>
                    </button>

                    <a href="#" className="disabled download-button button">
                        <Download size={20}/>
                    </a>
                </div>
                <div className="volume-wrapper">
                    <button disabled={loaded ? false : true} className="button">
                        <Volume size={20}/>
                        <VolumeX size={20}/>
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