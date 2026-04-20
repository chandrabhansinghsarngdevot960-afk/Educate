const EDCB = {
    currentClass: '10',
    async init() {
        if (typeof edcbData === 'undefined') {
            console.error('data.js did not load correctly.');
            return;
        }

        this.cacheElements();
        this.connectHandlers();
        await this.loadDashboard(this.currentClass);
        this.loadStudentImages();
    },

    cacheElements() {
        this.resultForm = document.getElementById('result-form');
        this.resultOutput = document.getElementById('result-output');
        this.resetButton = document.getElementById('reset-result');
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
        this.autoUpdateStatus = document.getElementById('auto-update-status');

        this.aiTextInputBtn = document.getElementById('text-input-btn');
        this.aiUploadPhotoBtn = document.getElementById('upload-photo-btn');
        this.aiCameraBtn = document.getElementById('camera-btn');
        this.aiQuestionInput = document.getElementById('ai-question');
        this.aiNameInput = document.getElementById('student-name');
        this.aiFileInput = document.getElementById('ai-file-input');
        this.aiSendBtn = document.getElementById('ai-send-btn');
        this.aiResponseBox = document.getElementById('ai-response-box');
        this.aiResponseContent = document.getElementById('ai-response-content');
        this.aiStatusText = document.getElementById('ai-status-text');
        this.aiCameraPanel = document.getElementById('ai-camera-panel');
        this.aiCameraVideo = document.getElementById('ai-camera-video');
        this.aiCaptureBtn = document.getElementById('ai-capture-btn');
        this.aiCloseCameraBtn = document.getElementById('ai-close-camera-btn');
        this.aiCameraPreview = document.getElementById('ai-camera-preview');
        this.aiCameraCanvas = document.getElementById('ai-camera-canvas');
    },

    connectHandlers() {
        this.resultForm.addEventListener('submit', event => {
            event.preventDefault();
            this.onResultSearch();
        });

        this.resetButton.addEventListener('click', () => {
            this.resultOutput.innerHTML = '';
        });

        if (this.aiTextInputBtn) {
            this.aiTextInputBtn.addEventListener('click', () => {
                this.aiQuestionInput?.focus();
            });
        }

        if (this.aiUploadPhotoBtn) {
            this.aiUploadPhotoBtn.addEventListener('click', () => {
                this.aiFileInput?.click();
            });
        }

        if (this.aiCameraBtn) {
            this.aiCameraBtn.addEventListener('click', () => {
                this.openCameraUI();
            });
        }

        if (this.aiFileInput) {
            this.aiFileInput.addEventListener('change', event => {
                this.handleImageUpload(event.target.files);
            });
        }

        if (this.aiSendBtn) {
            this.aiSendBtn.addEventListener('click', () => {
                this.handleAISend();
            });
        }

        if (this.aiCaptureBtn) {
            this.aiCaptureBtn.addEventListener('click', () => {
                this.captureCameraFrame();
            });
        }

        if (this.aiCloseCameraBtn) {
            this.aiCloseCameraBtn.addEventListener('click', () => {
                this.closeCameraUI();
            });
        }
    },

    loadStudentImages() {
        const images = [
            { id: 'student-preview-1', src: 'TOP/student1.png' },
            { id: 'student-preview-2', src: 'TOP/student2.png' },
            { id: 'student-preview-3', src: 'TOP/student3.gif' }
        ];
        
        images.forEach(item => {
            const img = document.getElementById(item.id);
            if (img) {
                img.src = item.src;
                img.onload = () => {
                    img.classList.add('has-image');
                };
                img.onerror = () => {
                    img.src = '';
                    img.classList.remove('has-image');
                };
            }
        });
    },

    async loadDashboard(classKey) {
        this.selectedClass = edcbData.classData[classKey];
        await this.loadAutoUpdatingNews();
        this.renderMiniTicker();
        this.renderSidebarNews();
        this.renderPdfLinks();
        this.renderDownloads();
        this.renderVideoGrid();
        this.renderSchedule();
        this.renderQuickStats();
        this.resultOutput.innerHTML = '';
    },

    // Load auto-updating news from news-updates.json
    async loadAutoUpdatingNews() {
        try {
            const response = await fetch('./news-updates.json');
            if (!response.ok) throw new Error('News file not found');

            const newsData = await response.json();

            // Store for use in other functions
            this.autoNews = newsData;

            console.log('✅ Auto-update system active');
            console.log('📰 Last updated:', newsData.lastUpdated);
            console.log('⏰ Next update:', newsData.autoUpdate.nextUpdate);
            console.log('📊 News items loaded:', newsData.allNews?.length || 0);

            // Show status indicator
            if (this.autoUpdateStatus) {
                this.autoUpdateStatus.style.display = 'inline-flex';
                this.autoUpdateStatus.textContent = `🔄 Auto-Update Active (${newsData.allNews?.length || 0} news)`;
            }

            return true; // Success

        } catch (error) {
            console.warn('Auto-updating news not available:', error.message);
            // Create fallback news data
            this.autoNews = {
                lastUpdated: new Date().toISOString(),
                autoUpdate: { enabled: false, frequency: '6 hours' },
                allNews: [
                    {
                        id: 'fallback_1',
                        title: 'System Initializing',
                        content: 'Auto-update system is setting up. News will appear soon.',
                        source: 'System',
                        date: new Date().toISOString()
                    }
                ]
            };
            return false; // Fallback used
        }
    },

    renderMiniTicker() {
        const news = this.selectedClass.Live_News_Ticker.slice(0, 1);
        const tickerText = news.length ? `LIVE: ${news[0].text}` : 'Live updates are coming...';
        this.miniTicker.textContent = tickerText;
        
        // If auto-updated news is available, show it too
        if (this.autoNews && this.autoNews.allNews && this.autoNews.allNews.length > 0) {
            const latestNews = this.autoNews.allNews[0];
            this.miniTicker.innerHTML = `
                <span class="auto-update-badge">🔄 Auto-Update Active</span>
                <span class="latest-news">📢 ${latestNews.title}</span>
            `;
            this.miniTicker.title = `Last updated: ${new Date(this.autoNews.lastUpdated).toLocaleString()}`;
        }
    },

    renderSidebarNews() {
        let newsHtml = this.selectedClass.Live_News_Ticker.map(item => `
            <div class="ticker-item">
                <strong>${item.text}</strong>
                <small>${item.impact}</small>
            </div>
        `).join('');

        // Add auto-updated news if available
        if (this.autoNews && this.autoNews.allNews && this.autoNews.allNews.length > 0) {
            const autoNewsHtml = this.autoNews.allNews.slice(0, 3).map(news => `
                <div class="ticker-item auto-news-item">
                    <strong>🔄 ${news.title}</strong>
                    <small>${news.content.substring(0, 50)}${news.content.length > 50 ? '...' : ''}</small>
                    <div class="news-source">${news.source || 'Auto-Update'}</div>
                </div>
            `).join('');
            newsHtml = autoNewsHtml + newsHtml;
        }

        this.sidebarNews.innerHTML = newsHtml;
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
        const classKey = this.currentClass;
        let resultUrl = '';

        if (classKey === '8') {
            resultUrl = 'https://rajshaladarpan.rajasthan.gov.in/Class5th_8thExam/Home/Result23_Class5th8th.aspx';
        } else if (classKey === '10') {
            resultUrl = 'https://www.fastresult.in/board-results/2026/rajasthan/10th-r26/';
        } else if (classKey === '12') {
            resultUrl = 'https://example.com/class12/results';
        }

        this.resultOutput.innerHTML = `
            <div class="loading-animation">
                <div class="neon-loader"></div>
                <p>Connecting to EDCB Secure Result Servers...</p>
            </div>
        `;

        setTimeout(() => {
            const brandedUrl = `result.html?url=${encodeURIComponent(resultUrl)}&class=${classKey}`;
            window.open(brandedUrl, '_blank', 'width=1200,height=800');
            this.resultOutput.innerHTML = `<p>Opening official RBSE result portal...</p>`;
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', async () => await EDCB.init());