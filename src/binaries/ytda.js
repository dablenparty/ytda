import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function downloadFromInfo(videoInfo) {
  const fileSafeTitle = videoInfo.videoDetails.title.replace(
    /[/\\?%*:|"<>]/g,
    "-"
  );
  const fileSafeAuthor = videoInfo.videoDetails.author.replace(
    /[/\\?%*:|"<>]/g,
    "-"
  );
  const downloadsFolder = app.getPath("downloads");
  const videoPath = join(
    downloadsFolder,
    `${fileSafeTitle} - ${fileSafeAuthor}.mp3`
  );
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
}
