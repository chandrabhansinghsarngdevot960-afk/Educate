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
    },

    cacheElements() {
        this.classButtons = document.getElementById('class-buttons');
        this.resultClass = document.getElementById('result-class');
        this.resultForm = document.getElementById('result-form');
        this.resultRoll = document.getElementById('result-roll');
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
        this.printButton = document.getElementById('print-btn');
    },

    connectHandlers() {
        this.resultForm.addEventListener('submit', event => {
            event.preventDefault();
            this.onResultSearch();
        });

        this.resetButton.addEventListener('click', () => {
            this.resultRoll.value = '';
            this.resultOutput.innerHTML = '';
        });

        this.printButton.addEventListener('click', () => {
            if (this.resultOutput.innerHTML.trim().length) {
                window.print();
            } else {
                alert('Please generate a marksheet first.');
            }
        });
    },

    buildClassOptions() {
        const classes = edcbData.classes;
        this.resultClass.innerHTML = classes.map(value => `
            <option value="${value}">Class ${value}</option>
        `).join('');
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
            const list = this.selectedClass.Downloads[section].map(item => `
                <li><a href="${item.link}" target="_blank">${item.title}<span>${item.format}</span></a></li>
            `).join('');
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
        if (!roll) {
            this.resultOutput.innerHTML = `<p>Please enter a roll number.</p>`;
            return;
        }

        const record = edcbData.classData[classKey].Result_Records[roll];
        if (!record) {
            this.resultOutput.innerHTML = `
                <div class="mark-sheet">
                    <header>
                        <div>
                            <h3>Result Not Found</h3>
                            <p>Roll number ${roll} was not located in Class ${classKey} records.</p>
                        </div>
                    </header>
                </div>
            `;
            return;
        }

        this.resultOutput.innerHTML = this.buildMarksheet(record);
    },

    buildMarksheet(record) {
        const total = record.subjects.reduce((sum, item) => sum + item.marks, 0);
        const maxTotal = record.subjects.reduce((sum, item) => sum + item.max, 0);
        const percent = ((total / maxTotal) * 100).toFixed(2);
        const grade = percent >= 75 ? 'A+' : percent >= 60 ? 'A' : percent >= 50 ? 'B' : percent >= 35 ? 'C' : 'D';
        const status = percent >= 35 ? 'Passed' : 'Reappear';

        const subjectRows = record.subjects.map(subject => `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.max}</td>
                <td>${subject.marks}</td>
            </tr>
        `).join('');

        return `
            <div class="mark-sheet">
                <header>
                    <div>
                        <h3>RBSE Digital Marksheet</h3>
                        <p>Class ${record.class} • Roll No. ${record.roll}</p>
                    </div>
                    <div>
                        <p><strong>Student:</strong> ${record.name}</p>
                        <p><strong>School:</strong> ${record.school}</p>
                        <p><strong>Exam:</strong> ${record.examSession}</p>
                    </div>
                </header>
                <div class="sheet-grid">
                    <div>
                        <p><strong>Board:</strong> RBSE Rajasthan</p>
                        <p><strong>Board Code:</strong> ${record.boardCode}</p>
                    </div>
                    <div>
                        <p><strong>Percentage:</strong> ${percent}%</p>
                        <p><strong>Grade:</strong> ${grade}</p>
                        <p class="status">${status}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Max Marks</th>
                            <th>Scored</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td><strong>${maxTotal}</strong></td>
                            <td><strong>${total}</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <p style="margin-top: 18px; color: var(--muted);">Data generated from the local EDCB results database and styled for print.</p>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => EDCB.init());