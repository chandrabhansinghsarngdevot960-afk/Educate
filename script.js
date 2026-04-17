import { languages, translations } from './data/i18n.js';
import { courseDatabase } from './data/classes/courseDatabase.js';
import { subjectDatabase } from './data/classes/subjectDatabase.js';
import { notesDatabase } from './data/notes/notesDatabase.js';
import { videosDatabase } from './data/videos/videosDatabase.js';
import { practiceQuestionsDatabase } from './data/practice/practiceQuestionsDatabase.js';
import { testsDatabase } from './data/tests/testsDatabase.js';
import { booksDatabase } from './data/books/booksDatabase.js';

let uiLanguage = localStorage.getItem('selectedLanguage') || 'hindi';
let contentLanguage = 'hindi';
let currentFilter = 'school';
let currentTestType = 'test';

const sectionPlaceholders = {
    class: 'selectClass',
    subject: 'selectSubject',
    board: 'boardLabel'
};

let newsItems = [];
let autoBooksData = [];
let currentPdf = null;
let currentPdfPage = 1;
let totalPdfPages = 0;

window.addEventListener('DOMContentLoaded', init);

async function init() {
    setLanguageSelectValue(uiLanguage);
    populateAllClassSelectors();
    populateCourses(currentFilter);
    updateAllTexts();
    await loadNewsData();
    await loadAutoBooks();
    updateHomeNews();
    setupSearch();
    openSection('home');
    animateOnScroll();
}

function setLanguageSelectValue(language) {
    const select = document.getElementById('languageSelect');
    if (select) select.value = language;
}

function openSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const section = document.getElementById(`${sectionName}-section`);
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    updateSectionContent(sectionName);
}

function updateSectionContent(sectionName) {
    switch (sectionName) {
        case 'home':
            break;
        case 'courses':
            populateCourses(currentFilter);
            break;
        case 'notes':
            loadSubjects('classSelect', 'subjectSelect');
            loadNotes();
            break;
        case 'videos':
            loadSubjects('videoClassSelect', 'videoSubjectSelect');
            loadVideos();
            break;
        case 'practice':
            loadSubjects('practiceClassSelect', 'practiceSubjectSelect');
            loadPracticeQuestions();
            break;
        case 'tests':
            loadSubjects('testClassSelect', 'testSubjectSelect');
            loadTests();
            break;
        case 'books':
            loadSubjects('bookClassSelect', 'bookSubjectSelect');
            loadBooks();
            break;
    }
}

function populateCourses(category) {
    currentFilter = category;
    let courses = [];
    
    if (category === 'school') {
        courses = courseDatabase.school || [];
    } else if (category === 'college') {
        courses = []; // No college data yet
    } else if (category === 'university') {
        courses = []; // No university data yet
    }
    
    const coursesGrid = document.getElementById('coursesGrid');

    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`.category-btn[data-category="${category}"]`);
    if (activeButton) activeButton.classList.add('active');

    if (!coursesGrid) return;
    coursesGrid.innerHTML = '';

    if (courses.length === 0) {
        coursesGrid.innerHTML = `<p class="empty-state">${category === 'school' ? 'No courses available' : 'Coming soon...'}</p>`;
        return;
    }

    courses.forEach((course, index) => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.style.animation = `scaleIn 0.6s ease ${index * 0.08}s both`;
        card.innerHTML = `
            <div class="course-emoji">${course.emoji}</div>
            <h3>${course.name}</h3>
            <p>${course.nameEn}</p>
            <button class="card-button" onclick="selectCourse(${course.id})">${t('view')}</button>
        `;
        coursesGrid.appendChild(card);
    });
}

function selectCourse(courseId) {
    currentFilter = 'school';
    openSection('notes');
    document.getElementById('classSelect').value = courseId;
    loadSubjects('classSelect', 'subjectSelect');
}

function populateAllClassSelectors() {
    const allClasses = courseDatabase.school;
    const selectorIds = ['classSelect', 'videoClassSelect', 'practiceClassSelect', 'testClassSelect', 'bookClassSelect'];

    selectorIds.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = `${t('selectClass')} / ${t('class')}`;
        select.appendChild(placeholder);

        allClasses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            select.appendChild(option);
        });
    });

    updateAllSelectPlaceholders();
}

async function loadNewsData() {
    try {
        const response = await fetch('data/news.json');
        if (response.ok) {
            const data = await response.json();
            newsItems = data.filter(item => item.headline).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        }
    } catch (error) {
        console.warn('Unable to load news.json', error);
    }
}

async function loadAutoBooks() {
    try {
        // Load from links.json for real PDFs
        const linksResponse = await fetch('data/links.json');
        if (linksResponse.ok) {
            const linksData = await linksResponse.json();
            autoBooksData = linksData.map(link => ({
                id: link.id,
                class: link.class,
                subject: link.subject,
                title: link.title,
                language: link.language,
                author: link.board || 'NCERT',
                size: link.size,
                board: link.board,
                downloadUrl: link.url
            }));
        }

        // Also try loading from autoBooks.json for any additional scraped content
        const autoBooksResponse = await fetch('data/books/autoBooks.json');
        if (autoBooksResponse.ok) {
            const scrapedData = await autoBooksResponse.json();
            if (Array.isArray(scrapedData) && scrapedData.length > 0) {
                autoBooksData = [...autoBooksData, ...scrapedData];
            }
        }
    } catch (error) {
        console.warn('Unable to load books data', error);
    }
}

function getBookCatalog() {
    return [...booksDatabase, ...autoBooksData];
}

function updateHomeNews() {
    const listContainer = document.getElementById('homeNewsList');
    const picksContainer = document.getElementById('homeVideoPicks');
    if (!listContainer || !picksContainer) return;

    listContainer.innerHTML = '';
    const latestNews = newsItems.slice(0, 5);
    if (latestNews.length === 0) {
        listContainer.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No news yet'}</p>`;
    } else {
        latestNews.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'news-item';
            entry.innerHTML = `
                <div class="news-headline">${item.headline}</div>
                <div class="news-meta">${item.source || 'RBSE'} • ${item.date || ''}</div>
            `;
            listContainer.appendChild(entry);
        });
    }

    const premiumVideos = videosDatabase
        .slice()
        .sort(() => Math.random() - 0.5) // Random sort since no views property
        .filter(video => video.language === 'english' || video.language === 'hindi')
        .slice(0, 3);

    picksContainer.innerHTML = '';
    premiumVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'mini-video-card';
        card.innerHTML = `
            <div>${video.title}</div>
            <div class="news-meta">Class ${video.class} • ${video.subject}</div>
        `;
        picksContainer.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', event => {
        const query = event.target.value.trim();
        if (!query) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }
        const results = performSearch(query);
        displaySearchResults(results, query);
    });
}

function performSearch(query) {
    const normalized = query.toLowerCase();
    const results = [];

    courseDatabase.school.forEach(course => {
        if (course.name.toLowerCase().includes(normalized) || course.nameEn.toLowerCase().includes(normalized)) {
            results.push({ type: 'Course', title: course.name, description: course.nameEn, section: 'courses' });
        }
    });

    notesDatabase.forEach(note => {
        if ([note.title, note.subject, note.description, note.author].some(field => field?.toLowerCase().includes(normalized))) {
            results.push({ type: 'Notes', title: note.title, description: note.subject, section: 'notes' });
        }
    });

    videosDatabase.forEach(video => {
        if ([video.title, video.subject].some(field => field?.toLowerCase().includes(normalized))) {
            results.push({ type: 'Video', title: video.title, description: `Class ${video.class} • ${video.subject}`, section: 'videos' });
        }
    });

    practiceQuestionsDatabase.forEach(item => {
        if ([item.question, item.subject].some(field => field?.toLowerCase().includes(normalized))) {
            results.push({ type: 'Practice', title: item.question, description: `${item.class} • ${item.subject}`, section: 'practice' });
        }
    });

    testsDatabase.forEach(test => {
        if ([test.title, test.subject].some(field => field?.toLowerCase().includes(normalized))) {
            results.push({ type: 'Test', title: test.title, description: `${test.type} • ${test.subject}`, section: 'tests' });
        }
    });

    getBookCatalog().forEach(book => {
        if ([book.title, book.subject, book.language].some(field => field?.toLowerCase().includes(normalized))) {
            results.push({ type: 'Book', title: book.title, description: `${book.subject} • ${book.language}`, section: 'books' });
        }
    });

    newsItems.forEach(news => {
        if (news.headline.toLowerCase().includes(normalized) || news.source?.toLowerCase().includes(normalized)) {
            results.push({ type: 'News', title: news.headline, description: news.source || 'RBSE', section: 'home' });
        }
    });

    return results.slice(0, 10);
}

function displaySearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    if (results.length === 0) {
        container.innerHTML = `<div class="search-empty">No results found for “${query}”.</div>`;
        return;
    }

    results.forEach(result => {
        const item = document.createElement('button');
        item.className = 'search-result-item';
        item.innerHTML = `<strong>${result.title}</strong><span>${result.type}</span><p>${result.description}</p>`;
        item.onclick = () => {
            openSection(result.section);
            container.classList.add('hidden');
        };
        container.appendChild(item);
    });
}

function openBookViewer(bookIndex) {
    const books = getBookCatalog();
    const book = books[bookIndex];
    if (!book?.file) {
        alert(`${book?.title || 'Book'} ${t('notAvailable')}`);
        return;
    }
    const url = `downloads/${book.file}`;
    const modal = document.getElementById('pdfModal');
    const titleEl = document.getElementById('pdfTitle');
    const openLink = document.getElementById('pdfOpenLink');
    if (!modal || !titleEl || !openLink) return;

    titleEl.textContent = book.title;
    openLink.href = url;
    currentPdfPage = 1;
    modal.classList.add('show');

    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        pdfjsLib.getDocument(url).promise.then(pdf => {
            currentPdf = pdf;
            totalPdfPages = pdf.numPages;
            renderPdfPage(currentPdfPage);
        }).catch(() => {
            document.getElementById('pdfPageIndicator').textContent = 'Unable to load PDF';
        });
    } else {
        document.getElementById('pdfPageIndicator').textContent = 'PDF.js unavailable';
    }
}

function renderPdfPage(pageNumber) {
    if (!currentPdf) return;
    currentPdf.getPage(pageNumber).then(page => {
        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 1.2 });
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        page.render({ canvasContext: context, viewport });
        document.getElementById('pdfPageIndicator').textContent = `Page ${pageNumber} / ${totalPdfPages}`;
    });
}

function prevPdfPage() {
    if (!currentPdf || currentPdfPage <= 1) return;
    currentPdfPage -= 1;
    renderPdfPage(currentPdfPage);
}

function nextPdfPage() {
    if (!currentPdf || currentPdfPage >= totalPdfPages) return;
    currentPdfPage += 1;
    renderPdfPage(currentPdfPage);
}

function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    if (!modal) return;
    modal.classList.remove('show');
    const canvas = document.getElementById('pdfCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    currentPdf = null;
}

function loadSubjects(classSelectId, subjectSelectId) {
    const classId = parseInt(document.getElementById(classSelectId)?.value, 10);
    const subjectSelect = document.getElementById(subjectSelectId);
    if (!subjectSelect) return;

    subjectSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = `${t('selectSubject')} / ${t('subject')}`;
    subjectSelect.appendChild(placeholder);

    const subjects = subjectDatabase[classId] || [];
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

function setLanguage(lang, type, button) {
    contentLanguage = lang;
    const container = document.querySelector(`#${type}-section .language-toggle`);
    if (container) {
        container.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        if (button) button.classList.add('active');
    }

    if (type === 'notes') {
        loadNotes();
    } else if (type === 'videos') {
        loadVideos();
    }
}

function loadNotes() {
    const classId = parseInt(document.getElementById('classSelect')?.value, 10);
    const subject = document.getElementById('subjectSelect')?.value;
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;

    if (!classId || !subject) {
        notesGrid.innerHTML = `<p class="empty-state">${t('selectClass')} ${t('and')} ${t('selectSubject')}</p>`;
        return;
    }

    const notes = notesDatabase.filter(n => n.class === classId && n.subject === subject && n.language === contentLanguage);

    if (notes.length === 0) {
        notesGrid.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No notes found'}</p>`;
        return;
    }

    notesGrid.innerHTML = '';
    notes.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.08}s both`;
        card.innerHTML = `
            <div class="card-title">${note.title}</div>
            <div class="card-description">
                <p>${t('author')}: ${note.author}</p>
                <p>⭐ ${note.rating}</p>
            </div>
            <button class="card-button" onclick="downloadNote(${note.id})">${t('download')}</button>
        `;
        notesGrid.appendChild(card);
    });
}

function downloadNote(noteId) {
    const note = notesDatabase.find(n => n.id === noteId);
    if (!note?.downloadUrl) {
        alert(`${note?.title || 'Note'} ${t('download')} ${t('notAvailable')}`);
        return;
    }

    const link = document.createElement('a');
    link.href = note.downloadUrl;
    link.download = note.title.replace(/[^a-z0-9]+/gi, '_') + '.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function loadVideos() {
    const classId = parseInt(document.getElementById('videoClassSelect')?.value, 10);
    const subject = document.getElementById('videoSubjectSelect')?.value;
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) return;

    let videos = [];
    if (!classId || !subject) {
        videos = videosDatabase
            .slice()
            .sort((a, b) => b.views - a.views)
            .filter(video => contentLanguage === 'mixed' || video.language === contentLanguage)
            .slice(0, 6);
        if (videos.length > 0) {
            videosGrid.innerHTML = `<p class="empty-state">Recommended premium videos for ${contentLanguage === 'mixed' ? 'all languages' : contentLanguage}</p>`;
        }
    } else {
        videos = videosDatabase.filter(v => v.class === classId && v.subject === subject);
        if (contentLanguage !== 'mixed') {
            videos = videos.filter(v => v.language === contentLanguage);
        }
    }

    if (videos.length === 0) {
        videosGrid.innerHTML = `<p class="empty-state">${t('selectClass')} ${t('and')} ${t('selectSubject')}</p>`;
        return;
    }

    if (videos.length === 0) {
        videosGrid.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No videos found'}</p>`;
        return;
    }

    videosGrid.innerHTML = '';
    videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.08}s both`;
        card.innerHTML = `
            <div class="card-title">${video.title}</div>
            <div class="card-description">
                <p>${t('teacher')}: ${video.teacher}</p>
                <p>👁️ ${video.views.toLocaleString()} ${t('views')}</p>
            </div>
            <button class="card-button" onclick="playVideo('${video.url}', '${video.title}')">${t('play')}</button>
        `;
        videosGrid.appendChild(card);
    });
}

function playVideo(videoUrl, title) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    const titleEl = document.getElementById('videoTitle');
    if (!modal || !iframe || !titleEl) return;

    // Extract YouTube ID from URL
    let youtubeId = '';
    if (videoUrl.includes('youtube.com/watch?v=')) {
        youtubeId = videoUrl.split('v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
        youtubeId = videoUrl.split('youtu.be/')[1].split('?')[0];
    }

    iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
    titleEl.textContent = title;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    if (iframe) iframe.src = '';
    if (modal) modal.classList.remove('show');
}

function loadPracticeQuestions() {
    const classId = parseInt(document.getElementById('practiceClassSelect')?.value, 10);
    const subject = document.getElementById('practiceSubjectSelect')?.value;
    const difficulty = document.getElementById('difficultySelect')?.value;
    const container = document.getElementById('practiceContainer');
    if (!container) return;

    if (!classId || !subject) {
        container.innerHTML = `<p class="empty-state">${t('selectClass')} ${t('and')} ${t('selectSubject')}</p>`;
        return;
    }

    let questions = practiceQuestionsDatabase.filter(q => q.class === classId && q.subject === subject);
    if (difficulty) {
        questions = questions.filter(q => q.difficulty === difficulty);
    }
    if (questions.length === 0) {
        container.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No questions found'}</p>`;
        return;
    }

    container.innerHTML = '';
    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style.animation = `slideInRight 0.5s ease ${index * 0.08}s both`;
        const difficultyEmoji = q.difficulty === 'easy' ? '🟢' : q.difficulty === 'medium' ? '🟡' : '🔴';

        card.innerHTML = `
            <div class="question-header">
                <span>${difficultyEmoji} ${q.difficulty}</span>
                <span>${t('question')} ${index + 1}</span>
            </div>
            <div class="question-text">${q.question}</div>
            <div class="options">
                ${q.options.map((option, optionIndex) => `
                    <div class="option" onclick="selectAnswer(this, ${optionIndex}, ${q.correct})">${String.fromCharCode(65 + optionIndex)}) ${option}</div>
                `).join('')}
            </div>
            <button class="card-button" onclick="showAnswer(${q.correct})">${t('view')}</button>
        `;
        container.appendChild(card);
    });
}

function selectAnswer(element, selected, correct) {
    element.classList.add('selected');
    if (selected === correct) {
        element.style.background = 'rgba(0, 255, 100, 0.15)';
        element.style.borderColor = '#00ff64';
    } else {
        element.style.background = 'rgba(255, 0, 100, 0.15)';
        element.style.borderColor = '#ff0064';
    }
}

function showAnswer(correct) {
    alert(`${t('correct')} ${String.fromCharCode(65 + correct)}`);
}

function loadTests() {
    const classId = parseInt(document.getElementById('testClassSelect')?.value, 10);
    const subject = document.getElementById('testSubjectSelect')?.value;
    const testsGrid = document.getElementById('testsGrid');
    if (!testsGrid) return;

    if (!classId || !subject) {
        testsGrid.innerHTML = `<p class="empty-state">${t('selectClass')} ${t('and')} ${t('selectSubject')}</p>`;
        return;
    }

    const tests = testsDatabase.filter(t => t.class === classId && t.subject === subject && t.type === currentTestType);
    if (tests.length === 0) {
        testsGrid.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No tests found'}</p>`;
        return;
    }

    testsGrid.innerHTML = '';
    tests.forEach((test, index) => {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.08}s both`;
        const details = test.type === 'test'
            ? `${test.duration} mins | ${test.questions} questions`
            : test.type === 'papers'
                ? `${test.year} | Old Paper`
                : `${test.duration} mins | Model Paper`;

        card.innerHTML = `
            <div class="card-title">${test.title}</div>
            <div class="card-description"><p>${details}</p></div>
            <button class="card-button" onclick="startTest(${test.id})">${t('start')}</button>
        `;
        testsGrid.appendChild(card);
    });
}

function filterCourses(category, button) {
    if (button) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }
    populateCourses(category);
}

function filterTests(type, button) {
    document.querySelectorAll('.test-category').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    loadTests();
}

function startTest(testId) {
    alert(`${t('start')} ${t('tests')} #${testId}`);
}

function loadBooks() {
    const classId = parseInt(document.getElementById('bookClassSelect')?.value, 10);
    const subject = document.getElementById('bookSubjectSelect')?.value;
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    if (!classId || !subject) {
        booksGrid.innerHTML = `<p class="empty-state">${t('selectClass')} ${t('and')} ${t('selectSubject')}</p>`;
        return;
    }

    let books = getBookCatalog().filter(b => b.class === classId && b.subject === subject);

    if (books.length === 0) {
        booksGrid.innerHTML = `<p class="empty-state">${t('noDataFound') || 'No books found'}</p>`;
        return;
    }

    booksGrid.innerHTML = '';
    books.forEach((book, index) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.style.animation = `fadeInUp 0.6s ease ${index * 0.08}s both`;
        const isPdf = book.file?.toLowerCase().endsWith('.pdf');
        card.innerHTML = `
            <div class="card-title">${book.title}</div>
            <div class="card-description">
                <p>${t('author')}: ${book.language === 'hindi' ? 'RBSE' : 'RBSE'}</p>
                <p>${t('size')}: PDF</p>
                <p>${t('board')}: RBSE</p>
            </div>
            <div class="book-actions">
                <button class="card-button" onclick="downloadBook(${index})">${t('download')}</button>
                ${isPdf ? `<button class="card-button secondary" onclick="openBookViewer(${index})">Open</button>` : ''}
            </div>
        `;
        booksGrid.appendChild(card);
    });
}

function downloadBook(bookIndex) {
    const books = getBookCatalog();
    const book = books[bookIndex];
    if (!book?.file) {
        alert(`${book?.title || 'Book'} ${t('download')} ${t('notAvailable')}`);
        return;
    }

    const link = document.createElement('a');
    link.href = `downloads/${book.file}`;
    link.download = book.file;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
}

function updateAllTexts() {
    const trans = translations[uiLanguage] || translations.hindi;
    document.documentElement.lang = uiLanguage;

    document.getElementById('sidebarLanguageLabel').textContent = trans.language;
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.getAttribute('data-section');
        const icon = item.querySelector('.icon')?.outerHTML || '';
        const text = trans[section] || item.textContent;
        item.innerHTML = `${icon} ${text}`;
    });

    document.getElementById('homeTitle').textContent = trans.welcome;
    document.getElementById('homeSubtitle').textContent = trans.subtitle;
    document.getElementById('feature1Title').textContent = trans.premiumFeature1;
    document.getElementById('feature1Desc').textContent = trans.premiumFeature1desc;
    document.getElementById('feature2Title').textContent = trans.premiumFeature2;
    document.getElementById('feature2Desc').textContent = trans.premiumFeature2desc;
    document.getElementById('feature3Title').textContent = trans.premiumFeature3;
    document.getElementById('feature3Desc').textContent = trans.premiumFeature3desc;
    document.getElementById('feature4Title').textContent = trans.premiumFeature4;
    document.getElementById('feature4Desc').textContent = trans.premiumFeature4desc;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = `${t('search')} ASTRON...`;
    }
    const liveNewsTitle = document.getElementById('homeLiveNewsTitle');
    if (liveNewsTitle) {
        liveNewsTitle.textContent = trans.liveNews || 'Live News';
    }
    const premiumPicksTitle = document.getElementById('homePremiumPicksTitle');
    if (premiumPicksTitle) {
        premiumPicksTitle.textContent = 'Video Picks';
    }

    document.getElementById('coursesHeader').textContent = trans.courses;
    document.getElementById('notesHeader').textContent = trans.notesSection;
    document.getElementById('videosHeader').textContent = trans.videosSection;
    document.getElementById('practiceHeader').textContent = trans.practiceSection;
    document.getElementById('testsHeader').textContent = trans.testsSection;
    document.getElementById('booksHeader').textContent = trans.booksSection;

    updateAllSelectPlaceholders();
}

function updateAllSelectPlaceholders() {
    const selectDefinitions = [
        { id: 'classSelect', label: 'selectClass' },
        { id: 'videoClassSelect', label: 'selectClass' },
        { id: 'practiceClassSelect', label: 'selectClass' },
        { id: 'testClassSelect', label: 'selectClass' },
        { id: 'bookClassSelect', label: 'selectClass' },
        { id: 'subjectSelect', label: 'selectSubject' },
        { id: 'videoSubjectSelect', label: 'selectSubject' },
        { id: 'practiceSubjectSelect', label: 'selectSubject' },
        { id: 'testSubjectSelect', label: 'selectSubject' },
        { id: 'bookSubjectSelect', label: 'selectSubject' },
        { id: 'bookBoardSelect', label: 'boardLabel' }
    ];

    selectDefinitions.forEach(def => {
        const select = document.getElementById(def.id);
        if (!select || select.options.length === 0) return;
        const option = select.options[0];
        option.textContent = t(def.label);
    });
}

const exposedFunctions = {
    openSection,
    filterCourses,
    setLanguage,
    changeLanguage,
    selectCourse,
    downloadNote,
    playVideo,
    closeModal,
    loadVideoSubjects: () => loadSubjects('videoClassSelect', 'videoSubjectSelect'),
    loadPracticeSubjects: () => loadSubjects('practiceClassSelect', 'practiceSubjectSelect'),
    loadTestSubjects: () => loadSubjects('testClassSelect', 'testSubjectSelect'),
    loadBookSubjects: () => loadSubjects('bookClassSelect', 'bookSubjectSelect'),
    loadNotes,
    loadVideos,
    loadPracticeQuestions,
    loadTests,
    loadBooks,
    filterTests,
    startTest,
    selectAnswer,
    showAnswer,
    openBookViewer,
    downloadBook
};
Object.entries(exposedFunctions).forEach(([name, fn]) => {
    window[name] = fn;
});

function changeLanguage() {
    const select = document.getElementById('languageSelect');
    if (!select) return;
    uiLanguage = select.value;
    localStorage.setItem('selectedLanguage', uiLanguage);
    updateAllTexts();
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        updateSectionContent(activeSection.id.replace('-section', ''));
    }
}

function t(key) {
    return translations[uiLanguage]?.[key] || translations.hindi[key] || key;
}

function animateOnScroll() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = entry.target.style.animation || 'fadeInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.section, .course-card, .note-card, .video-card, .question-card, .test-card, .book-card').forEach(element => observer.observe(element));
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeModal();
        closePdfModal();
    }
});
