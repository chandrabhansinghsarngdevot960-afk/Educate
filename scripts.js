/* EDCB FINAL FAIL-SAFE SCRIPT 
   Isme backup data bhi hai, taaki agar data.js fail ho jaye toh bhi news dikhe.
*/

window.onload = function() {
    console.log("EDCB Engine Started...");

    const newsList = document.getElementById('news-list');
    const videoGrid = document.getElementById('video-grid');

    // --- 1. BACKUP DATA (Agar data.js load na ho paye) ---
    const backupNews = [
        { title: "Main Examination Results - 2026 STATISTICS (Backup)", link: "#" },
        { title: "Data.js Load Error: Please check file path", link: "#" }
    ];

    // --- 2. LOAD NEWS LOGIC ---
    if(newsList) {
        // Check if myNews exists in data.js
        let currentNews = (typeof myNews !== 'undefined') ? myNews : backupNews;
        
        newsList.innerHTML = currentNews.map(n => `
            <a href="${n.link}" class="news-item" target="_blank">
                <span style="color:var(--neon); margin-right:5px;">▶</span> 
                ${n.title} 
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/New_ani.gif" 
                     style="width:28px; border:none; vertical-align:middle; display:inline-block; margin-left:5px;">
            </a>
        `).join('');
    }

    // --- 3. LOAD VIDEOS LOGIC ---
    if(videoGrid) {
        let currentVideos = (typeof myVideos !== 'undefined') ? myVideos : [];
        videoGrid.innerHTML = currentVideos.map(v => `
            <div class="v-card" style="border:1px solid var(--neon); background:rgba(255,255,255,0.02); padding:8px; border-radius:5px; margin-bottom:10px;">
                <iframe src="https://www.youtube.com/embed/${v.id}" 
                        frameborder="0" 
                        style="width:100%; aspect-ratio:16/9; border-radius:4px;" 
                        allowfullscreen></iframe>
                <p style="text-align:center; font-size:13px; margin:8px 0 0 0; color:var(--neon);">${v.title}</p>
            </div>
        `).join('');
    }

    // --- 4. LOAD PHOTOS LOGIC ---
    if(typeof photos !== 'undefined') {
        if(document.getElementById('cm-photo')) document.getElementById('cm-photo').src = photos.cm;
        if(document.getElementById('edu-photo')) document.getElementById('edu-photo').src = photos.minister;
        if(document.getElementById('main-building')) document.getElementById('main-building').src = photos.building;
    } else {
        // Default placeholder agar photos.js nahi mili
        const defaultImg = "https://picsum.photos/seed/edcb/300/400";
        if(document.getElementById('cm-photo')) document.getElementById('cm-photo').src = defaultImg;
        if(document.getElementById('edu-photo')) document.getElementById('edu-photo').src = defaultImg;
        if(document.getElementById('main-building')) document.getElementById('main-building').src = "https://picsum.photos/seed/board/800/400";
    }
};