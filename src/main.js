import './style.css'
import VideoCompressor from './js/ffmpeg'

if (!customElements.get('video-compressor')) {
    customElements.define('video-compressor', VideoCompressor);
}