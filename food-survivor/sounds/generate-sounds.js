// A simple script to generate placeholder sound files
const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

function generateSound(type) {
    const duration = 0.1;
    const audioBuffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        switch(type) {
            case 'hit':
                channelData[i] = Math.random() * 2 - 1;
                break;
            case 'shoot':
                channelData[i] = Math.sin(i * 0.1) * Math.exp(-i * 0.001);
                break;
            case 'levelup':
                channelData[i] = Math.sin(i * 0.2) * Math.sin(i * 0.3) * Math.exp(-i * 0.001);
                break;
        }
    }
    
    return audioBuffer;
}

// WAV file encoder
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer32 = new Int32Array(44 + buffer.length * bytesPerSample);
    const view = new DataView(buffer32.buffer);
    
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + buffer.length * bytesPerSample, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buffer.length * bytesPerSample, true);
    
    const samples = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }
    
    return new Uint8Array(view.buffer);
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Function to generate and download a specific sound
function generateAndDownload(type) {
    const buffer = generateSound(type);
    const wav = audioBufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.wav`;
    a.click();
    URL.revokeObjectURL(url);
}

// Only auto-generate if not called from HTML
if (typeof window === 'undefined') {
    ['hit', 'shoot', 'levelup'].forEach(type => {
        generateAndDownload(type);
    });
} 