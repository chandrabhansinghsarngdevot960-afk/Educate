document.addEventListener('DOMContentLoaded', () => {
    // Load News Update
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = myNews.map(n => `
        <a href="${n.link}" class="news-item">▶ ${n.title} 🆕</a>
    `).join('');

    // Load Videos
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = myVideos.map(v => `
        <div class="v-card">
            <iframe src="https://www.youtube.com/embed/${v.id}" frameborder="0" allowfullscreen></iframe>
            <p style="text-align:center; font-size:12px;">${v.title}</p>
        </div>
    `).join('');

    // Load Photos with Error Handling
    document.getElementById('cm-photo').src = photos.cm;
    document.getElementById('edu-photo').src = photos.minister;
    document.getElementById('main-building').src = photos.building;
});