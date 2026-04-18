document.addEventListener('DOMContentLoaded', () => {
    // Load News
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = myNews.map(item => `
        <a href="${item.link}" class="news-item" target="_blank">
            <i class="fas fa-chevron-right" style="font-size: 10px;"></i> ${item.title}
        </a>
    `).join('');

    // Load Videos
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = myVideos.map(vid => `
        <div class="vid-card">
            <iframe src="https://www.youtube.com/embed/${vid.id}" frameborder="0" allowfullscreen></iframe>
            <p style="font-size:12px; text-align:center;">${vid.title}</p>
        </div>
    `).join('');

    // Load Photos
    document.getElementById('cm-photo').src = photos.cm;
    document.getElementById('edu-photo').src = photos.minister;
    document.querySelector('.main-img').src = photos.building;
});