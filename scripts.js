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
        this.aiQuestionInput = document.getElementById('ai-question');
        this.aiNameInput = document.getElementById('student-name');
        this.aiFileInput = document.getElementById('ai-file-input');
        this.aiSendBtn = document.getElementById('ai-send-btn');
        this.aiResponseBox = document.getElementById('ai-response-box');
        this.aiResponseContent = document.getElementById('ai-response-content');
        this.aiStatusText = document.getElementById('ai-status-text');
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

        // Feature button handlers
        document.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feature = e.target.dataset.feature;
                this.showFeaturePanel(feature);
            });
        });

        // Quiz handlers
        this.quizSubject = document.getElementById('quiz-subject');
        this.quizDifficulty = document.getElementById('quiz-difficulty');
        this.startQuizBtn = document.getElementById('start-quiz');
        this.quizContent = document.getElementById('quiz-content');
        this.quizResults = document.getElementById('quiz-results');

        if (this.startQuizBtn) {
            this.startQuizBtn.addEventListener('click', () => this.startQuiz());
        }

        // Planner handlers
        this.plannerDate = document.getElementById('planner-date');
        this.plannerSubject = document.getElementById('planner-subject');
        this.plannerTopic = document.getElementById('planner-topic');
        this.plannerDuration = document.getElementById('planner-duration');
        this.addPlanBtn = document.getElementById('add-plan');
        this.plannerCalendar = document.getElementById('planner-calendar');

        if (this.addPlanBtn) {
            this.addPlanBtn.addEventListener('click', () => this.addStudyPlan());
        }

        // Flashcard handlers
        this.flashcardFront = document.getElementById('flashcard-front');
        this.flashcardBack = document.getElementById('flashcard-back');
        this.flashcardSubject = document.getElementById('flashcard-subject');
        this.addFlashcardBtn = document.getElementById('add-flashcard');
        this.flashcardDeck = document.getElementById('flashcard-deck');
        this.prevCardBtn = document.getElementById('prev-card');
        this.nextCardBtn = document.getElementById('next-card');
        this.flipCardBtn = document.getElementById('flip-card');
        this.cardCounter = document.getElementById('card-counter');

        if (this.addFlashcardBtn) {
            this.addFlashcardBtn.addEventListener('click', () => this.addFlashcard());
        }
        if (this.prevCardBtn) this.prevCardBtn.addEventListener('click', () => this.navigateCard(-1));
        if (this.nextCardBtn) this.nextCardBtn.addEventListener('click', () => this.navigateCard(1));
        if (this.flipCardBtn) this.flipCardBtn.addEventListener('click', () => this.flipCard());

        // Timer handlers
        this.startTimerBtn = document.getElementById('start-timer');
        this.pauseTimerBtn = document.getElementById('pause-timer');
        this.resetTimerBtn = document.getElementById('reset-timer');
        this.timerDisplay = document.getElementById('timer-display');
        this.studyDuration = document.getElementById('study-duration');
        this.breakDuration = document.getElementById('break-duration');
        this.sessionCount = document.getElementById('session-count');
        this.timerStats = document.getElementById('timer-stats');

        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        if (this.resetTimerBtn) this.resetTimerBtn.addEventListener('click', () => this.resetTimer());

        // Calculator handlers
        this.addGradeRowBtn = document.getElementById('add-grade-row');
        this.calculateGradeBtn = document.getElementById('calculate-grade');
        this.gradeResult = document.getElementById('grade-result');

        if (this.addGradeRowBtn) this.addGradeRowBtn.addEventListener('click', () => this.addGradeRow());
        if (this.calculateGradeBtn) this.calculateGradeBtn.addEventListener('click', () => this.calculateGrade());

        // Dictionary handlers
        this.dictSearch = document.getElementById('dict-search');
        this.searchWordBtn = document.getElementById('search-word');
        this.dictionaryResult = document.getElementById('dictionary-result');

        if (this.searchWordBtn) this.searchWordBtn.addEventListener('click', () => this.searchDictionary());

        // Theme handlers
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.switchTheme(theme);
            });
        });

        document.getElementById('neon-effects')?.addEventListener('change', (e) => this.toggleNeon(e.target.checked));
        document.getElementById('glass-morphism')?.addEventListener('change', (e) => this.toggleGlass(e.target.checked));
        document.getElementById('animations')?.addEventListener('change', (e) => this.toggleAnimations(e.target.checked));
    },

    async handleAISend() {
        if (!this.aiSendBtn) return;

        const question = this.aiQuestionInput?.value?.trim();
        const name = this.aiNameInput?.value?.trim();
        const imageData = this.currentImageData || null;

        if (!question && !imageData) {
            this.updateAIStatus('Type a study question or attach a photo first.');
            return;
        }

        this.appendChatBubble('You', question || 'Photo question', 'user');
        this.setThinkingState(true);

        try {
            const response = await this.callAIApi({ question, name, imageData });
            if (response?.message) {
                this.appendChatBubble('EDCB Mentor', response.message, 'bot');
                this.updateAIStatus('EDCB Mentor sent a step-by-step answer.');
            } else {
                this.appendChatBubble('EDCB Mentor', 'Sorry, I could not interpret that. Try again with a clearer question or photo.', 'bot');
                this.updateAIStatus('Need a better question or photo.');
            }
        } catch (error) {
            console.error(error);
            const message = error?.message || 'The mentor hit a snag. Please try again in a moment.';
            this.appendChatBubble('EDCB Mentor', message, 'bot');
            this.updateAIStatus(`AI request failed: ${message}`);
        } finally {
            this.setThinkingState(false);
            this.currentImageData = null;
            if (this.aiFileInput) this.aiFileInput.value = '';
        }
    },

    async callAIApi({ question, name, imageData }) {
        const payload = {
            question: question || '',
            name: name || '',
            imageData: imageData || ''
        };

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const body = await response.json().catch(() => null);
            if (!response.ok) {
                const message = body?.error || response.statusText || 'AI backend returned an error';
                throw new Error(message);
            }

            return body;
        } catch (error) {
            this.updateAIStatus('Backend unavailable, trying direct Gemini fallback...');
            return this.callGeminiDirect(payload);
        }
    },

    appendChatBubble(label, text, type) {
        if (!this.aiResponseContent) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;
        bubble.innerHTML = `<small>${label}</small>${text.replace(/\n/g, '<br>')}`;
        this.aiResponseContent.appendChild(bubble);
        this.aiResponseContent.scrollTop = this.aiResponseContent.scrollHeight;
    },

    async callGeminiDirect(payload) {
        const key = 'AIzaSyDpKP6AShxDF7kh2chMTedtE8hdzUAf1Jo';
        const question = (payload.question || '').trim();
        const name = (payload.name || '').trim();
        const imageData = payload.imageData || null;

        const systemPrompt = `You are EDCB Mentor, a legit study friend. Answer study questions step-by-step. If a student uploads a photo, analyze it instantly. Talk casually, use students' names (if provided), and be encouraging. Avoid robotic formal language. Your job is to help them understand, not just pass.`;
        const namePrefix = name ? `Hey ${name}, ` : '';
        const textPrompt = question
            ? `${namePrefix}${question}`
            : `${namePrefix}Please analyze this photo and explain everything step-by-step.`;

        const promptMessage = {
            role: 'system',
            content: systemPrompt
        };

        const userMessage = imageData
            ? {
                  role: 'user',
                  content: [
                      { type: 'input_text', text: textPrompt },
                      { type: 'input_image', image_uri: imageData }
                  ]
              }
            : {
                  role: 'user',
                  content: textPrompt
              };

        const requestBody = {
            prompt: { messages: [promptMessage, userMessage] },
            temperature: 0.35,
            max_output_tokens: 900,
            candidate_count: 1
        };

        const response = await fetch(`https://gemini.googleapis.com/v1/models/gemini-1.5-mini:generate?key=${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const message = data?.error?.message || response.statusText || 'Direct Gemini request failed';
            throw new Error(message);
        }

        const candidate = data?.candidates?.[0];
        let message = '';
        if (candidate) {
            if (typeof candidate.content === 'string') {
                message = candidate.content;
            } else if (Array.isArray(candidate.content)) {
                message = candidate.content.map(item => item.text || '').join('');
            } else if (candidate.content?.text) {
                message = candidate.content.text;
            }
        }

        if (!message) {
            throw new Error('Direct Gemini returned no answer.');
        }

        return { message };
    },

    setThinkingState(active) {
        if (!this.aiResponseBox) return;
        this.aiResponseBox.classList.toggle('thinking', active);
        const label = document.getElementById('ai-thinking-label');
        if (label) {
            label.textContent = active ? 'EDCB Mentor is thinking...' : 'Ready to help.';
        }
    },

    updateAIStatus(message) {
        if (this.aiStatusText) {
            this.aiStatusText.textContent = message;
        }
    },


    handleImageUpload(files) {
        if (!files || !files.length) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.currentImageData = reader.result;
            this.updateAIStatus('Photo uploaded. Press Send to ask EDCB Mentor.');
        };
        reader.readAsDataURL(file);
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
    },

    // ===== NEW FEATURE METHODS =====

    showFeaturePanel(feature) {
        // Hide all feature panels
        document.querySelectorAll('.feature-panel').forEach(panel => {
            panel.style.display = 'none';
        });

        // Show selected feature panel
        const panel = document.getElementById(`${feature}-panel`);
        if (panel) {
            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth' });

            // Initialize feature if needed
            switch(feature) {
                case 'quiz':
                    this.initializeQuiz();
                    break;
                case 'flashcards':
                    this.initializeFlashcards();
                    break;
                case 'planner':
                    this.initializePlanner();
                    break;
                case 'timer':
                    this.initializeTimer();
                    break;
                case 'tracker':
                    this.initializeTracker();
                    break;
                case 'calculator':
                    this.initializeCalculator();
                    break;
                case 'dictionary':
                    this.initializeDictionary();
                    break;
                case 'theme':
                    this.initializeTheme();
                    break;
            }
        }
    },

    // Quiz System
    initializeQuiz() {
        this.currentQuiz = null;
        this.quizScore = 0;
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
    },

    async startQuiz() {
        const subject = this.quizSubject.value;
        const difficulty = this.quizDifficulty.value;

        if (!subject) {
            alert('Please select a subject');
            return;
        }

        // Load quiz data from news-updates.json (which contains quiz data)
        try {
            const response = await fetch('./news-updates.json');
            const data = await response.json();

            if (data.sources?.quizzes?.quizzes?.[subject]) {
                this.quizQuestions = data.sources.quizzes.quizzes[subject]
                    .filter(q => !difficulty || q.difficulty === difficulty)
                    .slice(0, 10); // Take 10 questions

                if (this.quizQuestions.length === 0) {
                    alert('No quiz questions available for this subject and difficulty');
                    return;
                }

                this.currentQuestionIndex = 0;
                this.quizScore = 0;
                this.showQuestion();
                this.quizResults.style.display = 'none';
                this.quizContent.style.display = 'block';
            } else {
                alert('Quiz data not available. Please wait for auto-update.');
            }
        } catch (error) {
            alert('Failed to load quiz data');
        }
    },

    showQuestion() {
        const question = this.quizQuestions[this.currentQuestionIndex];
        this.quizContent.innerHTML = `
            <div class="question-card">
                <h3>Question ${this.currentQuestionIndex + 1}/10</h3>
                <p class="question-text">${question.question}</p>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <button class="option-btn" data-index="${index}">${option}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners to options
        this.quizContent.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.answerQuestion(parseInt(e.target.dataset.index)));
        });
    },

    answerQuestion(selectedIndex) {
        const question = this.quizQuestions[this.currentQuestionIndex];
        const selectedAnswer = question.options[selectedIndex];
        const isCorrect = selectedAnswer === question.answer;

        if (isCorrect) this.quizScore++;

        // Show result
        this.quizContent.innerHTML += `
            <div class="answer-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <p>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
                <p>Correct answer: ${question.answer}</p>
            </div>
        `;

        setTimeout(() => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < this.quizQuestions.length) {
                this.showQuestion();
            } else {
                this.showQuizResults();
            }
        }, 2000);
    },

    showQuizResults() {
        const percentage = Math.round((this.quizScore / this.quizQuestions.length) * 100);
        this.quizContent.style.display = 'none';
        this.quizResults.style.display = 'block';
        this.quizResults.innerHTML = `
            <div class="quiz-results-card">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <div class="score-circle">${percentage}%</div>
                    <p>You scored ${this.quizScore} out of ${this.quizQuestions.length}</p>
                </div>
                <div class="performance-message">
                    ${percentage >= 80 ? '🎉 Excellent work!' : 
                      percentage >= 60 ? '👍 Good job!' : 
                      '📚 Keep practicing!'}
                </div>
                <button id="retake-quiz" class="action-btn">Take Another Quiz</button>
            </div>
        `;

        document.getElementById('retake-quiz').addEventListener('click', () => this.startQuiz());
    },

    // Study Planner
    initializePlanner() {
        this.studyPlans = JSON.parse(localStorage.getItem('edcb-study-plans') || '[]');
        this.renderPlanner();
    },

    addStudyPlan() {
        const date = this.plannerDate.value;
        const subject = this.plannerSubject.value;
        const topic = this.plannerTopic.value;
        const duration = parseInt(this.plannerDuration.value);

        if (!date || !subject || !topic || !duration) {
            alert('Please fill all fields');
            return;
        }

        const plan = {
            id: Date.now(),
            date,
            subject,
            topic,
            duration,
            completed: false
        };

        this.studyPlans.push(plan);
        this.saveStudyPlans();
        this.renderPlanner();

        // Clear form
        this.plannerDate.value = '';
        this.plannerSubject.value = '';
        this.plannerTopic.value = '';
        this.plannerDuration.value = '';
    },

    renderPlanner() {
        const today = new Date().toISOString().split('T')[0];
        const weekPlans = this.studyPlans.filter(plan => {
            const planDate = new Date(plan.date);
            const todayDate = new Date(today);
            const diffTime = planDate - todayDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        });

        this.plannerCalendar.innerHTML = weekPlans.map(plan => `
            <div class="plan-item ${plan.completed ? 'completed' : ''}">
                <div class="plan-header">
                    <span class="plan-date">${new Date(plan.date).toLocaleDateString()}</span>
                    <span class="plan-subject">${plan.subject}</span>
                </div>
                <div class="plan-content">
                    <h4>${plan.topic}</h4>
                    <p>${plan.duration} minutes</p>
                    <button class="complete-btn" data-id="${plan.id}">
                        ${plan.completed ? '✓ Completed' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        this.plannerCalendar.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.togglePlanComplete(id);
            });
        });
    },

    togglePlanComplete(id) {
        const plan = this.studyPlans.find(p => p.id === id);
        if (plan) {
            plan.completed = !plan.completed;
            this.saveStudyPlans();
            this.renderPlanner();
        }
    },

    saveStudyPlans() {
        localStorage.setItem('edcb-study-plans', JSON.stringify(this.studyPlans));
    },

    // Flashcards
    initializeFlashcards() {
        this.flashcards = JSON.parse(localStorage.getItem('edcb-flashcards') || '[]');
        this.currentCardIndex = 0;
        this.showingFront = true;
        this.renderFlashcards();
    },

    addFlashcard() {
        const front = this.flashcardFront.value.trim();
        const back = this.flashcardBack.value.trim();
        const subject = this.flashcardSubject.value;

        if (!front || !back || !subject) {
            alert('Please fill all fields');
            return;
        }

        const card = {
            id: Date.now(),
            front,
            back,
            subject,
            created: new Date().toISOString()
        };

        this.flashcards.push(card);
        this.saveFlashcards();
        this.renderFlashcards();

        // Clear form
        this.flashcardFront.value = '';
        this.flashcardBack.value = '';
    },

    renderFlashcards() {
        if (this.flashcards.length === 0) {
            this.flashcardDeck.innerHTML = '<p>No flashcards yet. Add some above!</p>';
            this.cardCounter.textContent = '0/0';
            return;
        }

        const card = this.flashcards[this.currentCardIndex];
        this.flashcardDeck.innerHTML = `
            <div class="flashcard ${this.showingFront ? 'front' : 'back'}">
                <div class="card-content">
                    ${this.showingFront ? card.front : card.back}
                </div>
                <div class="card-subject">${card.subject}</div>
            </div>
        `;

        this.cardCounter.textContent = `${this.currentCardIndex + 1}/${this.flashcards.length}`;
    },

    navigateCard(direction) {
        if (this.flashcards.length === 0) return;

        this.currentCardIndex += direction;
        if (this.currentCardIndex < 0) this.currentCardIndex = this.flashcards.length - 1;
        if (this.currentCardIndex >= this.flashcards.length) this.currentCardIndex = 0;

        this.showingFront = true;
        this.renderFlashcards();
    },

    flipCard() {
        this.showingFront = !this.showingFront;
        this.renderFlashcards();
    },

    saveFlashcards() {
        localStorage.setItem('edcb-flashcards', JSON.stringify(this.flashcards));
    },

    // Study Timer
    initializeTimer() {
        this.timerRunning = false;
        this.timerPaused = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isBreak = false;
        this.currentSession = 1;
        this.totalSessions = parseInt(this.sessionCount.value) || 4;
        this.updateTimerDisplay();
    },

    startTimer() {
        if (this.timerRunning) return;

        this.timerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);

        this.startTimerBtn.textContent = 'Running...';
        this.pauseTimerBtn.disabled = false;
    },

    pauseTimer() {
        if (!this.timerRunning) return;

        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.startTimerBtn.textContent = 'Resume';
        this.pauseTimerBtn.disabled = true;
    },

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerRunning = false;
        this.timerPaused = false;
        this.timeLeft = (this.isBreak ? parseInt(this.breakDuration.value) : parseInt(this.studyDuration.value)) * 60;
        this.startTimerBtn.textContent = 'Start';
        this.pauseTimerBtn.disabled = false;
        this.updateTimerDisplay();
    },

    timerComplete() {
        clearInterval(this.timerInterval);
        this.timerRunning = false;

        // Play notification sound (if supported)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('EDCB Timer', {
                body: this.isBreak ? 'Break time over! Back to studying.' : 'Study session complete! Take a break.',
                icon: '/favicon.ico'
            });
        }

        // Switch between study and break
        this.isBreak = !this.isBreak;
        this.timeLeft = (this.isBreak ? parseInt(this.breakDuration.value) : parseInt(this.studyDuration.value)) * 60;

        if (!this.isBreak) {
            this.currentSession++;
            if (this.currentSession > this.totalSessions) {
                this.currentSession = 1;
                alert('All sessions complete! Great work!');
            }
        }

        this.updateTimerDisplay();
        this.startTimerBtn.textContent = 'Start';
    },

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update session info
        const sessionInfo = `Session ${this.currentSession}/${this.totalSessions} - ${this.isBreak ? 'Break' : 'Study'}`;
        this.timerStats.innerHTML = `
            <div>Current: ${sessionInfo}</div>
            <div>Next: ${this.isBreak ? 'Study' : 'Break'}</div>
        `;
    },

    // Progress Tracker
    initializeTracker() {
        this.loadProgressData();
        this.renderProgressChart();
        this.renderSubjectProgress();
    },

    loadProgressData() {
        this.progressData = JSON.parse(localStorage.getItem('edcb-progress') || '{}');
        this.progressData.totalStudyTime = this.progressData.totalStudyTime || 0;
        this.progressData.quizzesCompleted = this.progressData.quizzesCompleted || 0;
        this.progressData.averageScore = this.progressData.averageScore || 0;
        this.progressData.subjects = this.progressData.subjects || {};
    },

    renderProgressChart() {
        // Simple progress visualization
        const chart = document.getElementById('progress-chart');
        const totalTime = Math.floor(this.progressData.totalStudyTime / 60); // hours
        const quizzes = this.progressData.quizzesCompleted;
        const avgScore = this.progressData.averageScore;

        chart.innerHTML = `
            <div class="progress-bars">
                <div class="progress-bar">
                    <label>Study Hours: ${totalTime}h</label>
                    <div class="bar" style="width: ${Math.min(totalTime * 10, 100)}%"></div>
                </div>
                <div class="progress-bar">
                    <label>Quizzes: ${quizzes}</label>
                    <div class="bar" style="width: ${Math.min(quizzes * 10, 100)}%"></div>
                </div>
                <div class="progress-bar">
                    <label>Average Score: ${avgScore}%</label>
                    <div class="bar" style="width: ${avgScore}%"></div>
                </div>
            </div>
        `;

        // Update stats
        document.getElementById('total-study-time').textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;
        document.getElementById('quizzes-completed').textContent = quizzes;
        document.getElementById('average-score').textContent = `${avgScore}%`;
    },

    renderSubjectProgress() {
        const container = document.getElementById('subject-progress');
        const subjects = Object.keys(this.progressData.subjects);

        container.innerHTML = subjects.map(subject => {
            const data = this.progressData.subjects[subject];
            return `
                <div class="subject-progress-item">
                    <h4>${subject}</h4>
                    <div class="subject-stats">
                        <span>Quizzes: ${data.quizzes || 0}</span>
                        <span>Avg Score: ${data.averageScore || 0}%</span>
                        <span>Study Time: ${Math.floor((data.studyTime || 0) / 60)}h</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Grade Calculator
    initializeCalculator() {
        this.gradeRows = [];
        this.addGradeRow(); // Add first row
    },

    addGradeRow() {
        const row = document.createElement('div');
        row.className = 'grade-row';
        row.innerHTML = `
            <input type="text" placeholder="Subject" class="subject-input" />
            <input type="number" placeholder="Marks Obtained" class="marks-input" min="0" max="100" />
            <input type="number" placeholder="Total Marks" class="total-input" min="1" max="100" />
            <input type="number" placeholder="Weight (%)" class="weight-input" min="1" max="100" value="100" />
            <button class="remove-grade">×</button>
        `;

        document.querySelector('.grade-inputs').appendChild(row);

        // Add remove functionality
        row.querySelector('.remove-grade').addEventListener('click', () => {
            row.remove();
        });
    },

    calculateGrade() {
        const rows = document.querySelectorAll('.grade-row');
        let totalWeightedScore = 0;
        let totalWeight = 0;

        rows.forEach(row => {
            const subject = row.querySelector('.subject-input').value.trim();
            const marks = parseFloat(row.querySelector('.marks-input').value);
            const total = parseFloat(row.querySelector('.total-input').value);
            const weight = parseFloat(row.querySelector('.weight-input').value);

            if (subject && !isNaN(marks) && !isNaN(total) && !isNaN(weight)) {
                const percentage = (marks / total) * 100;
                totalWeightedScore += (percentage * weight);
                totalWeight += weight;
            }
        });

        if (totalWeight === 0) {
            this.gradeResult.innerHTML = '<p>Please enter valid grade data</p>';
            return;
        }

        const finalGrade = totalWeightedScore / totalWeight;
        const letterGrade = this.getLetterGrade(finalGrade);

        this.gradeResult.innerHTML = `
            <div class="grade-result-card">
                <h3>Final Grade: ${finalGrade.toFixed(2)}%</h3>
                <div class="letter-grade">${letterGrade}</div>
                <div class="grade-breakdown">
                    <p>Weighted Average Calculation</p>
                    <p>Total Weighted Score: ${totalWeightedScore.toFixed(2)}</p>
                    <p>Total Weight: ${totalWeight}</p>
                </div>
            </div>
        `;
    },

    getLetterGrade(percentage) {
        if (percentage >= 90) return 'A+ (Outstanding)';
        if (percentage >= 80) return 'A (Excellent)';
        if (percentage >= 70) return 'B (Good)';
        if (percentage >= 60) return 'C (Satisfactory)';
        if (percentage >= 50) return 'D (Pass)';
        return 'F (Fail)';
    },

    // Dictionary
    initializeDictionary() {
        this.dictionaryData = {
            'algorithm': 'A step-by-step procedure for solving a problem',
            'variable': 'A storage location with a symbolic name',
            'function': 'A block of code that performs a specific task',
            'array': 'A data structure that stores multiple values',
            'loop': 'A programming construct that repeats a block of code',
            'database': 'An organized collection of data',
            'network': 'A group of interconnected computers',
            'encryption': 'The process of converting data into a coded format',
            'debugging': 'The process of finding and fixing errors in code',
            'interface': 'A point where two systems meet and interact'
        };
    },

    searchDictionary() {
        const word = this.dictSearch.value.trim().toLowerCase();
        if (!word) {
            this.dictionaryResult.innerHTML = '<p>Please enter a word to search</p>';
            return;
        }

        const definition = this.dictionaryData[word];
        if (definition) {
            this.dictionaryResult.innerHTML = `
                <div class="dictionary-entry">
                    <h3>${word.charAt(0).toUpperCase() + word.slice(1)}</h3>
                    <p>${definition}</p>
                    <div class="word-actions">
                        <button class="bookmark-word">Bookmark</button>
                        <button class="pronounce-word">Pronounce</button>
                    </div>
                </div>
            `;
        } else {
            this.dictionaryResult.innerHTML = `
                <div class="no-result">
                    <p>Word not found in dictionary</p>
                    <p>Try: algorithm, variable, function, array, loop, database, network, encryption, debugging, interface</p>
                </div>
            `;
        }
    },

    // Theme Switcher
    initializeTheme() {
        this.currentTheme = localStorage.getItem('edcb-theme') || 'light';
        this.applyTheme(this.currentTheme);
    },

    switchTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem('edcb-theme', theme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
    },

    toggleNeon(enabled) {
        document.documentElement.classList.toggle('neon-disabled', !enabled);
        localStorage.setItem('edcb-neon', enabled);
    },

    toggleGlass(enabled) {
        document.documentElement.classList.toggle('glass-disabled', !enabled);
        localStorage.setItem('edcb-glass', enabled);
    },

    toggleAnimations(enabled) {
        document.documentElement.classList.toggle('animations-disabled', !enabled);
        localStorage.setItem('edcb-animations', enabled);
    }
};

document.addEventListener('DOMContentLoaded', async () => await EDCB.init());