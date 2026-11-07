const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { renderFrame, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } = require('./renderer');

async function main() {
  console.log(`Starting Digikala Motion Graphics video generation...`);
  console.log(`Resolution: ${WIDTH}x${HEIGHT} @ ${FPS}fps | Total frames: ${TOTAL_FRAMES} (21.5s)`);

  const audioPath = path.resolve(__dirname, '../audio/master_audio.aac');
  const outputDir = path.resolve(__dirname, '../output');
  const outputPath = path.join(outputDir, 'digikala_motion_graphics.mp4');

  if (!fs.existsSync(audioPath)) {
    console.error(`Audio file not found at ${audioPath}!`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', FPS.toString(),
    '-i', '-',
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outputPath
  ];

  console.log(`Spawning ffmpeg process...`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  const tStart = Date.now();
  let lastLogTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const canvas = renderFrame(frame);
    const jpegBuffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });

    const ok = ffmpeg.stdin.write(jpegBuffer);
    if (!ok) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    if (Date.now() - lastLogTime > 2000 || frame === TOTAL_FRAMES - 1) {
      const pct = (((frame + 1) / TOTAL_FRAMES) * 100).toFixed(1);
      const fpsReal = ((frame + 1) / ((Date.now() - tStart) / 1000)).toFixed(1);
      console.log(`Rendered frame ${frame + 1}/${TOTAL_FRAMES} (${pct}%) at ~${fpsReal} fps`);
      lastLogTime = Date.now();
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });

  const totalTime = ((Date.now() - tStart) / 1000).toFixed(1);
  console.log(`\n🎉 Success! Video rendered in ${totalTime}s`);
  console.log(`Final MP4: ${outputPath}`);

  const stat = fs.statSync(outputPath);
  console.log(`File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(err => {
  console.error("Rendering failed:", err);
  process.exit(1);
});
