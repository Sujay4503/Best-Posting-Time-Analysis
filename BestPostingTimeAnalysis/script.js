const YT_API_KEY = "AIzaSyCSEekA3rfYna2so27jCCrE_UVyhbsZoK0";

const PLATFORM_CONFIG = {
    youtube: {
        color: '#ef4444',
        name: 'YouTube',
        placeholder: 'Paste YouTube Video Link here...',
        labels: ['Views', 'Likes', 'Comments'],
        chartData: [50, 55, 70, 90, 100, 85, 75],
        insights: [
            "<strong>The Algorithm:</strong> YouTube heavily relies on early engagement (first 24 hours). Posting when audiences are online is crucial.",
            "<strong>Peak Days:</strong> Thursdays and Fridays are generally the best days to post to catch weekend viewers.",
            "<strong>Peak Hours:</strong> 2:00 PM to 4:00 PM (EST). You must post before peak viewing hours so YouTube has time to index."
        ]
    },
    instagram: {
        color: '#ec4899',
        name: 'Instagram',
        placeholder: 'Paste Instagram Post Link here...',
        labels: ['Impressions', 'Likes', 'Comments'],
        chartData: [60, 70, 95, 80, 85, 60, 50],
        insights: [
            "<strong>Visual First:</strong> Instagram peaks during mid-day breaks and evenings when people are resting.",
            "<strong>Peak Days:</strong> Wednesday is historically the highest engagement day.",
            "<strong>Peak Hours:</strong> 11:00 AM to 1:00 PM is the optimal window to catch the lunch-break scroll."
        ]
    },
    linkedin: {
        color: '#0a66c2',
        name: 'LinkedIn',
        placeholder: 'Paste LinkedIn Post Link here...',
        labels: ['Impressions', 'Reactions', 'Comments'],
        chartData: [75, 85, 88, 85, 70, 20, 15],
        insights: [
            "<strong>Professional Network:</strong> Usage closely mirrors the standard corporate workweek.",
            "<strong>Peak Days:</strong> Tuesday, Wednesday, and Thursday perform best. Avoid weekends.",
            "<strong>Peak Hours:</strong> 10:00 AM to 12:00 PM, or early morning around 8:00 AM."
        ]
    },
    twitter: {
        color: '#0f1419',
        name: 'X (Twitter)',
        placeholder: 'Paste X/Twitter Link here...',
        labels: ['Views', 'Likes', 'Replies'],
        chartData: [70, 75, 85, 80, 88, 55, 40],
        insights: [
            "<strong>Real-time News:</strong> Twitter has the shortest post lifespan, making exact timing critical.",
            "<strong>Peak Days:</strong> Wednesday and Friday mornings.",
            "<strong>Peak Hours:</strong> 9:00 AM is optimal for users catching up on daily news."
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    
    // Setup reference chart
    const platformCtx = document.getElementById('platformChart').getContext('2d');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    let currentChart = new Chart(platformCtx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Optimal Posting Score',
                data: PLATFORM_CONFIG.youtube.chartData,
                backgroundColor: PLATFORM_CONFIG.youtube.color,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false },
                x: { grid: { display: false } }
            }
        }
    });

    // Handle UI Platform Switching
    const platformSelect = document.getElementById('platform-select');
    const urlInput = document.getElementById('post-url');
    
    function updatePlatformUI() {
        const platform = platformSelect.value;
        const config = PLATFORM_CONFIG[platform];

        // Update Theme Color
        document.documentElement.style.setProperty('--color-primary', config.color);
        
        // Update Text & Placeholders
        urlInput.placeholder = config.placeholder;
        document.getElementById('chart-title-platform').textContent = config.name;
        
        document.getElementById('label-stat1').textContent = `Total ${config.labels[0]}`;
        document.getElementById('label-stat2').textContent = `Total ${config.labels[1]}`;
        document.getElementById('label-stat3').textContent = `Total ${config.labels[2]}`;

        // Update Insights
        const insightsList = document.getElementById('insights-list');
        insightsList.innerHTML = config.insights.map((ins, i) => `
            <li class="flex gap-3">
                <span class="text-theme font-bold">${i + 1}.</span>
                <p>${ins}</p>
            </li>
        `).join('');

        // Update Chart
        currentChart.data.datasets[0].data = config.chartData;
        currentChart.data.datasets[0].backgroundColor = config.color;
        currentChart.update();
        
        // Reset Results
        document.getElementById('video-results').classList.add('hidden');
    }

    platformSelect.addEventListener('change', updatePlatformUI);
    updatePlatformUI(); // Initialize on load

    // Helpers
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function formatNumber(num) {
        return parseInt(num).toLocaleString();
    }

    function analyzePublishTime(date, platform) {
        const day = date.getDay(); // 0 = Sun
        const hour = date.getHours(); 

        let isBest = false;
        let isAvg = false;

        if (platform === 'youtube') {
            isBest = (day >= 3 && day <= 5) && (hour >= 13 && hour <= 17);
            isAvg = (day >= 3 && day <= 5) || (hour >= 13 && hour <= 17);
        } else if (platform === 'instagram') {
            isBest = (day === 3) && (hour >= 11 && hour <= 13);
            isAvg = (day >= 1 && day <= 5);
        } else if (platform === 'linkedin') {
            isBest = (day >= 2 && day <= 4) && (hour >= 9 && hour <= 12);
            isAvg = (day >= 1 && day <= 5);
        } else if (platform === 'twitter') {
            isBest = (day === 3 || day === 5) && (hour === 9);
            isAvg = (day >= 1 && day <= 5);
        }

        if (isBest) {
            return { text: 'Optimal Posting Time', bgClass: 'bg-green-100', textClass: 'text-green-700' };
        } else if (isAvg) {
            return { text: 'Average Posting Time', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' };
        } else {
            return { text: 'Suboptimal Posting Time', bgClass: 'bg-red-100', textClass: 'text-red-700' };
        }
    }

    // Main Analyze Action
    document.getElementById('analyze-btn').addEventListener('click', async () => {
        const platform = platformSelect.value;
        const urlInputVal = document.getElementById('post-url').value;

        if (!urlInputVal.trim()) {
            alert("Please paste a link first.");
            return;
        }

        document.getElementById('video-results').classList.add('hidden');
        document.getElementById('loading-spinner').classList.remove('hidden');
        document.getElementById('loading-spinner').classList.add('flex');
        document.getElementById('loading-text').textContent = platform === 'youtube' ? 'Fetching live API data...' : 'Simulating data extraction...';

        try {
            if (platform === 'youtube') {
                const videoId = extractVideoId(urlInputVal);
                if (!videoId) throw new Error("Invalid YouTube URL");

                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YT_API_KEY}&part=snippet,statistics`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    const video = data.items[0];
                    renderResults({
                        title: video.snippet.title,
                        author: video.snippet.channelTitle,
                        publishedAt: new Date(video.snippet.publishedAt),
                        thumb: video.snippet.thumbnails.high.url || video.snippet.thumbnails.default.url,
                        views: video.statistics.viewCount,
                        likes: video.statistics.likeCount,
                        comments: video.statistics.commentCount
                    }, 'youtube');
                } else {
                    throw new Error("Video not found");
                }
            } else {
                // Simulate network delay for other platforms
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Generate realistic mock data based on platform
                const mockDate = new Date();
                mockDate.setDate(mockDate.getDate() - Math.floor(Math.random() * 30));
                mockDate.setHours(Math.floor(Math.random() * 24));
                
                let views = Math.floor(Math.random() * 50000) + 1000;
                let likes = Math.floor(views * (Math.random() * 0.08 + 0.02)); // 2-10% like rate
                let comments = Math.floor(likes * (Math.random() * 0.1 + 0.01));

                renderResults({
                    title: `Simulated ${PLATFORM_CONFIG[platform].name} Post`,
                    author: "@simulated_user",
                    publishedAt: mockDate,
                    thumb: null, // Use placeholder icon
                    views: views,
                    likes: likes,
                    comments: comments
                }, platform);
            }

        } catch (error) {
            console.error(error);
            alert("Error analyzing link. " + (platform === 'youtube' ? "Check if the YouTube link is correct." : ""));
        } finally {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('loading-spinner').classList.remove('flex');
        }
    });

    function renderResults(data, platform) {
        // Populate Meta
        const imgEl = document.getElementById('vid-thumb');
        const iconEl = document.getElementById('placeholder-icon');
        
        if (data.thumb) {
            imgEl.src = data.thumb;
            imgEl.classList.remove('hidden');
            iconEl.classList.add('hidden');
        } else {
            imgEl.classList.add('hidden');
            iconEl.classList.remove('hidden');
        }

        document.getElementById('vid-title').textContent = data.title;
        document.getElementById('vid-channel').textContent = data.author;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        document.getElementById('vid-published').textContent = "Published on: " + data.publishedAt.toLocaleDateString(undefined, options);

        // Stats
        document.getElementById('stat-views').textContent = formatNumber(data.views);
        document.getElementById('stat-likes').textContent = formatNumber(data.likes);
        document.getElementById('stat-comments').textContent = formatNumber(data.comments);

        let engagementRate = data.views > 0 ? (((parseInt(data.likes) + parseInt(data.comments)) / parseInt(data.views)) * 100) : 0;
        document.getElementById('stat-engagement').textContent = engagementRate.toFixed(2) + "%";

        // Time Analysis
        const analysis = analyzePublishTime(data.publishedAt, platform);
        const badge = document.getElementById('time-analysis-badge');
        badge.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold " + analysis.bgClass + " " + analysis.textClass;
        badge.innerHTML = `<span id="time-analysis-text">${analysis.text}</span>`;

        document.getElementById('video-results').classList.remove('hidden');
        document.getElementById('video-results').classList.add('grid');
    }

});
