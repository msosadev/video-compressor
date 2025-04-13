import './style.css'
import VideoCompressor from './js/ffmpeg'
import { PlayPauseButton, MuteButton } from './js/video-controls'

if (!customElements.get('video-compressor')) customElements.define('video-compressor', VideoCompressor);
if (!customElements.get('play-pause-button')) customElements.define('play-pause-button', PlayPauseButton, { extends: 'button' });
if (!customElements.get('mute-button')) customElements.define('mute-button', MuteButton, { extends: 'button' });