// Require all modules
const fs = require('fs');
const axios = require('axios');
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath)

const qualityMap = {
    low: 360,
    medium: 720,
    high: 1080,
    max: null,
};

const audioQualityMap = {
    low: '128k',
    medium: '192k',
    high: '256k',
};

let isDownloading = false

module.exports = (store, path, win) => {
    // Set ffmpeg path
    const ffmpegExecutable = ffmpegPath.includes('app.asar')
        ? ffmpegPath.replace('app.asar', 'app.asar.unpacked')
        : ffmpegPath;
    ffmpeg.setFfmpegPath(ffmpegExecutable);

    deleteTempFiles(store.get('selectedFolder', 0))

    // Function to delete all temporary files in the specified directory
    function deleteTempFiles(downloadPath) {
        fs.readdir(downloadPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }
            files.forEach(file => {
                if (file.endsWith('.temp')) {
                    fs.unlink(path.join(downloadPath, file), (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        }
                    });
                }
            });
        });
    }

    function endDownload(){
        isDownloading = false
        setTimeout(() => {
            if(!isDownloading){win.setProgressBar(-1);}
        }, 1000);
    }

    async function downloadMusic(event, url, title, thumbnail_url, author, format){
        console.log("---------------\nAsking to download music:\nTitle: " + title +
            "\nAuthor: " + author +
            "\nURL: " + url +
            "\nThumbnail URL: " + thumbnail_url +
            "\nFormat: " + format +
            "\n---------------");

        isDownloading = true
        win.setProgressBar(2)

        // Get the selected video quality from the settings
        const videoQuality = store.get('videoQuality', 'high');
        const audioQuality = store.get('audioQuality', 'high');

        // Set format to mp3 if it's not mp3 or mp4
        if (format != "mp3" && format != "mp4"){format="mp3"}
        // Get the download path
        let downloadPath = store.get('selectedFolder', 0)
        if (!downloadPath){
            return { error: "Veillez choisir, dans les paramètres, un dossier où stocker les fichiers téléchargés" };
        }else if (!fs.existsSync(downloadPath)){
            return { error: "Le dossier choisi pour stocker les fichiers téléchargés n'existe pas" };
        }

        console.log("Download path: " + downloadPath);
    
        // Try to download the music
        try {
            // Replace all forbidden characters in the title
            newtitle = title.replace(/[\\/:*?"<>|]/g, '')

            if (newtitle != title){
                console.warn("Le titre contient des caractères interdits, ils ont été retirés, c'est maintenant: " + title);
                title = newtitle;
            }

            // Set the download path
            const fileDownloadPath = path.join(downloadPath, `${title}.${format}`);
            // Set the temporary download path
            const downloadTempPath = fileDownloadPath.replace(`.${format}`, `.${format}.temp`);
            // Set the thumbnail path
            const thumbnailPath = path.join(downloadPath, 'thumbnail.jpg.temp');
        
            // Download the music
            if (format == "mp3"){
                // Download the thumbnail

                console.log("Lancement du téléchargement de la miniature");
                await downloadThumbnail(thumbnail_url, thumbnailPath);
                console.log("Fin du téléchargement de la miniature");

                console.log("Lancement du téléchargement de la musique");
                const audioStream = ytdl(url, { quality: 'highestaudio' });
                const audioFile = fs.createWriteStream(downloadTempPath);
                audioStream.pipe(audioFile);
                await new Promise((resolve, reject) => {
                    audioFile.on('finish', resolve);
                    audioFile.on('error', reject);
                });
                console.log("Fin du téléchargement de la musique");
        
                console.log("Lancement de l'ajout des métadonnées");
                // Add metadata to the music
                await addMetadata(fileDownloadPath, downloadTempPath, thumbnailPath, author, audioQuality, downloadPath);
                // Delete the thumbnail and the temporary file
                fs.unlink(thumbnailPath, (err) => {
                if (err) {
                    console.error('Erreur lors du remplacement du fichier original: ' + err);
                }});
                fs.unlink(downloadTempPath, (err) => {
                if (err) {
                    console.error('Erreur lors du remplacement du fichier original: ' + err);
                }});

                console.log("Fin de l'ajout des métadonnées");
                console.log('\x1b[32m', "--> Musique téléchargée avec succès dans le dossier: " + downloadPath);

            // If the format is mp4
            }else {
                // Set the temporary download path for the audio
                const downloadTempPathAudio = downloadTempPath.replace(`.${format}`, `-audio.m4a`);
                // Set the temporary download path for the video
                const downloadTempPathVideo = downloadTempPath.replace(`.${format}`, `-video.mp4`);

                console.log("Lancement du téléchargement de la vidéo sans l'audio");
                // Download the video
                const videoStream = ytdl(url, { filter: 'videoonly', quality: 'highestvideo', format: 'mp4' });
                const videoFile = fs.createWriteStream(downloadTempPathVideo);
                videoStream.pipe(videoFile);
                await new Promise((resolve, reject) => {
                    videoFile.on('finish', resolve);
                    videoFile.on('error', reject);
                });
                console.log("Fin du téléchargement de la vidéo sans l'audio");

                console.log("Lancement du téléchargement de l'audio");
                // Download the audio
                const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
                const audioFile = fs.createWriteStream(downloadTempPathAudio);
                audioStream.pipe(audioFile);
                await new Promise((resolve, reject) => {
                    audioFile.on('finish', resolve);
                    audioFile.on('error', reject);
                });
                console.log("Fin du téléchargement de l'audio");
            
                console.log("Lancement de la fusion de l'audio et de la vidéo, et de l'ajout des métadonnées");
                // Merge the audio and the video
                await mergeAudioAndVideo(fileDownloadPath, downloadTempPathVideo, downloadTempPathAudio, author, videoQuality, audioQuality, downloadPath);
                
                // Delete temporary files
                fs.unlink(downloadTempPathVideo, (err) => {
                if (err) {
                    console.error('Erreur lors du remplacement du fichier original: ' + err);
                }});
                fs.unlink(downloadTempPathAudio, (err) => {
                if (err) {
                    console.error('Erreur lors du remplacement du fichier original: ' + err);
                }});
                
                console.log('\x1b[32m', "--> Vidéo téléchargée avec succès dans le dossier: " + downloadPath);
            }
        
            // Return success
            endDownload();
            return { success: true };
        } catch (error) {
            console.error(error);

            console.error("Une erreur est survenue lors du téléchargement de la musique, suppression des fichiers temporaires");
            deleteTempFiles(downloadPath);
            endDownload();
            return { error: 1 };
        }
    };
    
    // Function to add metadata to the music
    async function addMetadata(filePath, fileTempPath, thumbnailPath, author, audioQuality='high', dir){
        return new Promise((resolve, reject) => {
            const command = ffmpeg()
                .input(fileTempPath)
                .input(thumbnailPath)
                .outputOptions('-map', '0', '-map', '1')
                .outputOptions('-metadata', `artist=${author}`)
                .outputOptions('-id3v2_version', '3')

            if (audioQualityMap[audioQuality]) {
                command.audioBitrate(audioQualityMap[audioQuality]);
            }

            command.save(filePath)
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    console.error(err);
                    deleteTempFiles(path.dirname(dir));
                    reject(err);
                });
        });
    }
    
    // Function to merge the audio and the video
    async function mergeAudioAndVideo(filePath, videoPath, audioPath, thumbnailPath, author, videoQuality='high', audioQuality='high', dir){
        return new Promise((resolve, reject) => {
            const command = ffmpeg()
                .input(videoPath)
                .input(audioPath)
                .outputOptions('-metadata', `artist=${author}`)
                .outputOptions('-id3v2_version', '3')
                .outputOptions('-c:a', 'aac')  // Encode audio to AAC
                
            if (qualityMap[videoQuality]) {
                command.size(`?x${qualityMap[videoQuality]}`)
            }else {
                command.outputOptions('-c:v', 'copy')  // Copy the video codec without re-encoding
            }

            if (audioQualityMap[audioQuality]) {
                command.audioBitrate(audioQualityMap[audioQuality]); // Set audio bitrate based on quality
            }

            command.save(filePath)
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    console.error(err);
                    deleteTempFiles(path.dirname(dir));
                    reject(err);
                });
        });
    }
    
    // Function to download the thumbnail
    async function downloadThumbnail(thumbnailUrl, savePath) {
        const writer = fs.createWriteStream(savePath);
        const response = await axios({
        url: thumbnailUrl,
        method: 'GET',
        responseType: 'stream'
        });
    
        response.data.pipe(writer);
    
        return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        });
    }

    return {
        downloadMusic,
    }
};