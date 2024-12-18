// Prefix for youtube urls
const youtubePrefixUrl = "https://www.youtube.com/watch?v="

module.exports = (innertube) => {
    // Get infos of a yt video
    async function fetchVideoInfo(event, url) {
        // Get the video ID from the URL
        const videoId = new URL(url).searchParams.get('v')

        // Get detailed information about the video
        let videoInfos = await innertube.getBasicInfo(videoId);
        videoInfos = videoInfos.basic_info
        
        return {
            infoTitle: videoInfos.title,
            infoAuthor: videoInfos.author,
            infoThumbnail: videoInfos.thumbnail[0].url,
            infoDurationString: formatTime(videoInfos.duration),
        };
    };

    // Function to search for a single video
    async function singleSearch(event, search) {
        // Search for the video
        let largeSearchResults = await innertube.search(search, filter={type: "video"});
        let searchResults = largeSearchResults.results.filter(result =>
            // Simplified filter to only exclude live videos
            result.type === 'Video' && 
            result.duration?.seconds && // Ensure video has duration
            !result.badges?.some(badge => 
                badge.icon_type === 'LIVE' || 
                badge.icon_type === 'UPCOMING'
            )
        );

        // If no video is found, try with a corrected query
        if (!searchResults[0]) {
            const didYouMean = largeSearchResults.results.find(item => item.type === 'DidYouMean')?.corrected_query?.text
            if (didYouMean){
                largeSearchResults = await innertube.search(didYouMean, filter={type: "video"});
                searchResults = largeSearchResults.results.filter(result =>
                    result.type === 'Video' && 
                    result.duration?.seconds &&
                    !result.badges?.some(badge => 
                        badge.icon_type === 'LIVE' || 
                        badge.icon_type === 'UPCOMING'
                    )
                );
            }
            if (!searchResults[0]) {
                return { error: 'Aucune vidéo ne convient à la recherche : ' + (didYouMean || search) }
            }
        }

        const video = searchResults[0]
        return {
            infoTitle: video.title.text,
            infoUrl: youtubePrefixUrl + video.id,
            infoThumbnail: video.thumbnails[0].url,
            infoAuthor: video.author.name,
            infoDurationString: formatTime(video.duration.seconds),
        };
    };

    // Function to search for multiple videos
    async function multipleSearch(event, search) {
        // Search for the videos
        let largeSearchResults = await innertube.search(search, filter={type: "video"});
        let searchResults = largeSearchResults.results.filter(result =>
            result.type === 'Video' && !result.badges?.some(badge => badge.icon_type === 'LIVE')
        );

        // If no video is found, try with a corrected query
        if (!searchResults[0]) {
            const didYouMean = largeSearchResults.results.find(item => item.type === 'DidYouMean')?.corrected_query?.text
            if (didYouMean){
                largeSearchResults = await innertube.search(didYouMean, filter={type: "video"});
                searchResults = largeSearchResults.results.filter(result =>
                    result.type === 'Video' && !result.badges?.some(badge => badge.icon_type === 'LIVE')
                );
                if (!searchResults[0]) {
                    return { error: 'Aucune vidéo ne convient à votre recherche' }
                }
            }else {
                return { error: 'Aucune vidéo ne convient à votre recherche' }
            }
        }
        const videos = []
        // Limit the number of videos to 50
        searchResults = searchResults.slice(0, 50)
        searchResults.forEach(video => {
            videos.push({
                infoTitle: video.title.text,
                infoUrl: youtubePrefixUrl + video.id,
                infoThumbnail: video.thumbnails[0].url,
                infoAuthor: video.author.name,
                infoDurationString: formatTime(video.duration.seconds),
            })
        });
        return videos
    };

    // Function to format the time
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        } else {
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }

    return {
        fetchVideoInfo,
        singleSearch,
        multipleSearch,
    }
};