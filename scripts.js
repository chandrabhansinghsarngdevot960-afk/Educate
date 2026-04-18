const EDCB = {
    currentClass: '10',
    init() {
        if (typeof edcbData === 'undefined') {
            console.error('data.js did not load correctly.');
            return;
        }

        this.cacheElements();
        this.connectHandlers();
        this.buildClassOptions();
        this.renderClassButtons();
        this.loadDashboard(this.currentClass);
        this.loadStudentImages();
        this.toggleUrlField();
    },

    cacheElements() {
        this.classButtons = document.getElementById('class-buttons');
        this.resultClass = document.getElementById('result-class');
        this.resultForm = document.getElementById('result-form');
        this.resultRoll = document.getElementById('result-roll');
        this.resultOutput = document.getElementById('result-output');
        this.resetButton = document.getElementById('reset-result');
        this.resultUrl = document.getElementById('result-url');
        this.urlField = document.getElementById('url-field');
        this.downloadGrid = document.getElementById('download-grid');
        this.videoGrid = document.getElementById('video-grid');
        this.liveTicker = document.getElementById('live-ticker');
        this.sidebarNews = document.getElementById('sidebar-news');
        this.pdfLinks = document.getElementById('pdf-links');
        this.scheduleList = document.getElementById('schedule-list');
        this.activeClassCount = document.getElementById('active-class-count');
        this.pdfCount = document.getElementById('pdf-count');
        this.videoCount = document.getElementById('video-count');
        this.miniTicker = document.getElementById('mini-ticker');
    },

    connectHandlers() {
        this.resultForm.addEventListener('submit', event => {
            event.preventDefault();
            this.onResultSearch();
        });

        this.resetButton.addEventListener('click', () => {
            this.resultRoll.value = '';
            this.resultUrl.value = '';
            this.resultOutput.innerHTML = '';
        });

        this.resultClass.addEventListener('change', () => {
            this.currentClass = this.resultClass.value;
            this.updateActiveClass();
            this.loadDashboard(this.currentClass);
            this.toggleUrlField();
        });
    },

    buildClassOptions() {
        const classes = edcbData.classes;
        this.resultClass.innerHTML = classes.map(value => `
            <option value="${value}">Class ${value}</option>
        `).join('');
        this.resultClass.value = this.currentClass;
    },

    renderClassButtons() {
        this.classButtons.innerHTML = edcbData.classes.map(value => `
            <button type="button" data-class="${value}" class="${value === this.currentClass ? 'active' : ''}">
                Class ${value}
            </button>
        `).join('');

        this.classButtons.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                this.currentClass = button.dataset.class;
                this.updateActiveClass();
                this.loadDashboard(this.currentClass);
            });
        });
    },

    updateActiveClass() {
        this.classButtons.querySelectorAll('button').forEach(button => {
            button.classList.toggle('active', button.dataset.class === this.currentClass);
        });
        this.resultClass.value = this.currentClass;
        this.toggleUrlField();
    },

    loadStudentImages() {
        const images = ['TOP/student1.png', 'TOP/student2.png'];
        images.forEach((src, index) => {
            const imgId = `student-preview-${index + 1}`;
            const img = document.getElementById(imgId);
            if (img) {
                img.src = src;
                img.onload = () => {
                    img.classList.add('has-image');
                    const previewCard = img.closest('.student-preview-card');
                    if (previewCard) {
                        const label = previewCard.querySelector('.preview-label');
                        if (label) label.style.display = 'none';
                    }
                };
                img.onerror = () => {
                    img.src = '';
                    img.classList.remove('has-image');
                    img.alt = 'Image not found';
                    const previewCard = img.closest('.student-preview-card');
                    if (previewCard) {
                        const label = previewCard.querySelector('.preview-label');
                        if (label) label.style.display = 'none';
                    }
                };
            }
        });
    },

    loadDashboard(classKey) {
        this.selectedClass = edcbData.classData[classKey];
        this.renderMiniTicker();
        this.renderSidebarNews();
        this.renderPdfLinks();
        this.renderDownloads();
        this.renderVideoGrid();
        this.renderSchedule();
        this.renderQuickStats();
        this.resultOutput.innerHTML = '';
    },

    renderMiniTicker() {
        const news = this.selectedClass.Live_News_Ticker.slice(0, 1);
        this.miniTicker.textContent = news.length ? `LIVE: ${news[0].text}` : 'Live updates are coming...';
    },

    renderSidebarNews() {
        this.sidebarNews.innerHTML = this.selectedClass.Live_News_Ticker.map(item => `
            <div class="ticker-item">
                <strong>${item.text}</strong>
                <small>${item.impact}</small>
            </div>
        `).join('');
    },

    renderPdfLinks() {
        const links = this.selectedClass.Official_PDF_Links;
        const items = Object.entries(links).map(([label, url]) => `
            <a href="${url}" target="_blank">
                ${label.replace(/_/g, ' ')} <span>▶</span>
            </a>
        `);
        this.pdfLinks.innerHTML = items.join('');
    },

    renderDownloads() {
        const sections = ['Syllabus', 'Model Papers', 'Old Question Papers'];
        this.downloadGrid.innerHTML = sections.map(section => {
            const list = this.selectedClass.Downloads[section].map(item => {
                return `<li><a href="${item.link}" target="_blank">${item.title}<span>${item.format}</span></a></li>`;
            }).join('');
            return `
                <div class="download-card">
                    <h3>${section}</h3>
                    <ul>${list}</ul>
                </div>
            `;
        }).join('');
    },

    renderVideoGrid() {
        this.videoGrid.innerHTML = edcbData.videoCategories.map(category => {
            const videos = category.videos
                .filter(video => video.classes.includes(this.currentClass))
                .map(video => `
                    <div class="video-card">
                        <h3>${video.title}</h3>
                        <iframe src="https://www.youtube.com/embed/${video.id}?rel=0" title="${video.title}" allowfullscreen></iframe>
                    </div>
                `).join('');

            return `
                <div class="video-card">
                    <h3>${category.category}</h3>
                    ${videos || '<p>No videos available for this class yet.</p>'}
                </div>
            `;
        }).join('');
    },

    renderSchedule() {
        this.scheduleList.innerHTML = this.selectedClass.Exam_Schedule.map(item => `
            <div class="schedule-item">
                <h3>${item.subject}</h3>
                <p>${item.date} • ${item.time}</p>
                <small>${item.location}</small>
            </div>
        `).join('');
    },

    renderQuickStats() {
        this.activeClassCount.textContent = this.selectedClass.Live_News_Ticker.length;
        this.pdfCount.textContent = Object.values(this.selectedClass.Official_PDF_Links).length;
        this.videoCount.textContent = edcbData.videoCategories.reduce((sum, category) => {
            return sum + category.videos.filter(video => video.classes.includes(this.currentClass)).length;
        }, 0);
    },

    onResultSearch() {
        const classKey = this.resultClass.value;
        const roll = this.resultRoll.value.trim();
        let resultUrl = '';

        if (classKey === '8') {
            resultUrl = 'https://rajshaladarpan.rajasthan.gov.in/Class5th_8thExam/Home/Result23_Class5th8th.aspx';
        } else if (classKey === '10') {
            resultUrl = 'https://www.fastresult.in/board-results/2026/rajasthan/10th-r26/';
        } else if (classKey === '12') {
            resultUrl = this.resultUrl.value.trim();
            if (!resultUrl) {
                this.resultOutput.innerHTML = `<p>Please enter the result URL for Class 12.</p>`;
                return;
            }
        }

        // Show loading animation
        this.resultOutput.innerHTML = `
            <div class="loading-animation">
                <div class="neon-loader"></div>
                <p>Connecting to EDCB Secure Result Servers...</p>
            </div>
        `;

        // Redirect after animation
        setTimeout(() => {
            // Open in branded window
            const brandedUrl = `result.html?url=${encodeURIComponent(resultUrl)}&class=${classKey}&roll=${roll}`;
            window.open(brandedUrl, '_blank', 'width=1200,height=800');
            this.resultOutput.innerHTML = `<p>Opening official RBSE result portal...</p>`;
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => EDCB.init());