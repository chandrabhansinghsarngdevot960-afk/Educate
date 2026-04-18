/* EDCB FINAL SCRIPT 
   Is file ko "script.js" naam se save karein
*/

window.onload = function() {
    console.log("EDCB Engine Started...");

    // 1. SELECTORS (Elements ko dhoondna)
    const newsList = document.getElementById('news-list');
    const videoGrid = document.getElementById('video-grid');
    const cmImg = document.getElementById('cm-photo');
    const eduImg = document.getElementById('edu-photo');
    const buildImg = document.getElementById('main-building');

    // 2. CHECK IF DATA EXISTS (Safety Check)
    if (typeof myNews === 'undefined') {
        console.error("ERROR: data.js file nahi mili!");
        if(newsList) newsList.innerHTML = "<p style='color:red; padding:10px;'>Galti: data.js file missing hai!</p>";
        return;
    }

    // 3. LOAD NEWS (Animated RBSE Style)
    if(newsList) {
        if(myNews.length === 0) {
            newsList.innerHTML = "<p style='padding:10px;'>Abhi koi news nahi hai.</p>";
        } else {
            newsList.innerHTML = myNews.map(n => `
                <a href="${n.link}" class="news-item" target="_blank">
                    <span style="color:var(--neon); margin-right:5px;">▶</span> 
                    ${n.title} 
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/New_ani.gif" 
                         alt="new" 
                         style="width:28px; border:none; vertical-align:middle; display:inline-block; margin-left:5px;">
                </a>
            `).join('');
            console.log("News loaded successfully!");
        }
    }

    // 4. LOAD VIDEOS (YouTube Grid)
    if(videoGrid && typeof myVideos !== 'undefined') {
        videoGrid.innerHTML = myVideos.map(v => `
            <div class="v-card" style="border:1px solid var(--neon); background:rgba(255,255,255,0.02); padding:8px; border-radius:5px;">
                <iframe src="https://www.youtube.com/embed/${v.id}" 
                        frameborder="0" 
                        style="width:100%; aspect-ratio:16/9; border-radius:4px;" 
                        allowfullscreen></iframe>
                <p style="text-align:center; font-size:13px; margin:8px 0 0 0; color:var(--neon);">${v.title}</p>
            </div>
        `).join('');
    }

    // 5. LOAD PHOTOS (Ministers & Board)
    if(typeof photos !== 'undefined') {
        if(cmImg) {
            cmImg.src = photos.cm;
            cmImg.onerror = function() { this.src = "https://via.placeholder.com/150?text=Photo+Missing"; };
        }
        if(eduImg) {
            eduImg.src = photos.minister;
            eduImg.onerror = function() { this.src = "https://via.placeholder.com/150?text=Photo+Missing"; };
        }
        if(buildImg) {
            buildImg.src = photos.building;
            buildImg.onerror = function() { this.src = "https://via.placeholder.com/600x300?text=Building+Image+Missing"; };
        }
    }
};