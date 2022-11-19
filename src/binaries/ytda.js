const { program } = require("commander");
const { default: ffmpegPath } = require("ffmpeg-static");
const { join, resolve } = require("path");
const { homedir } = require("os");
const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");

console.log(resolve("."));

if (!ffmpegPath) {
  throw new Error("ffmpeg-static not found");
}

ffmpeg.setFfmpegPath(ffmpegPath);

// TODO: make command line args for the following:
// * output dir
// * track name
// * track artist
const DOWNLOADS = join(homedir(), "Downloads");

program.argument("<url>", "YouTube URL to download").action(async (url) => {
  const videoInfo = await ytdl.getInfo(url);
  const fileSafeTitle = videoInfo.videoDetails.title.replace(
    /[/\\?%*:|"<>]/g,
    "-"
  );
  const fileSafeAuthor = videoInfo.videoDetails.author.name.replace(
    /[/\\?%*:|"<>]/g,
    "-"
  );
  const videoPath = join(DOWNLOADS, `${fileSafeTitle} - ${fileSafeAuthor}.mp3`);
  let done = false;
  let error = null;
  const videoStream = ytdl.downloadFromInfo(videoInfo, {
    quality: "highestaudio",
    filter: "audioonly",
  });
  ffmpeg(videoStream)
    .audioBitrate(videoInfo.formats[0].audioBitrate ?? 128)
    .withAudioCodec("libmp3lame")
    .toFormat("mp3")
    .saveToFile(videoPath)
    .on("error", (err) => {
      error = err;
      done = true;
    })
    .on("end", () => {
      done = true;
    });
  while (!done) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (error) {
    throw error;
  }
});

program.parse();
