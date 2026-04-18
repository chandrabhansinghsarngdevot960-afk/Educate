document.addEventListener('DOMContentLoaded', () => {
    // News Render
    const newsBox = document.getElementById('news-list');
    newsBox.innerHTML = myNews.map(n => `
        <a href="${n.link}" class="news-link" target="_blank">🔹 ${n.title}</a>
    `).join('');

    // Video Render
    const videoBox = document.getElementById('video-grid');
    videoBox.innerHTML = myVideos.map(v => `
        <div class="video-item">
            <iframe src="https://www.youtube.com/embed/${v.id}" frameborder="0" allowfullscreen></iframe>
            <p>${v.title}</p>
        </div>
    `).join('');

    // Photos Load
    document.getElementById('cm-photo').src = photos.cm;
    document.getElementById('edu-photo').src = photos.minister;
});