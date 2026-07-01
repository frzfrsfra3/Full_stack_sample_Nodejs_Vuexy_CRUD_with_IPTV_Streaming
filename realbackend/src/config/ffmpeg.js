module.exports = {
    binary: process.env.FFMPEG_BINARY || '/usr/bin/ffmpeg',
    hlsBasePath: process.env.HLS_BASE_PATH || '/var/www/stream/channels',
    hlsTime: 4,
    hlsListSize: 6,
};