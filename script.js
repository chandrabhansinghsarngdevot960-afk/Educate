import { booksDatabase } from './data/books/booksDatabase.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("ASTRON Ready");
    
    // Initialize Home
    openSection('home');
    loadNews();
});

// Function to switch sections
window.openSection = function(sectionId) {
    // Hide all
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    // Show target
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) targetSection.classList.add('active');

    // Active Sidebar button
    const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Load dynamic data based on section
    if (sectionId === 'books') renderBooks();
};

function loadNews() {
    const newsContainer = document.getElementById('home-news-ticker');
    if (!newsContainer) return;

    const newsList = [
        "⚡ RBSE Board Exam 2026 update: Date sheets expected soon.",
        "⚡ Class 12 Physics new notes uploaded.",
        "⚡ Welcome to ASTRON - Rajasthan's most advanced learning platform."
    ];

    newsContainer.innerHTML = newsList.map(n => `<p style="margin-bottom:10px; color:#00f2ff;">${n}</p>`).join('');
}

function renderBooks() {
    const grid = document.querySelector('.books-grid');
    if (!grid) return;

    // Filter only Board Classes: 5, 8, 10, 12
    const boardClasses = [5, 8, 10, 12];
    const filtered = booksDatabase.filter(b => boardClasses.includes(Number(b.class)));

    grid.innerHTML = filtered.map(book => `
        <div class="card">
            <h3>Class ${book.class}</h3>
            <p>${book.subject} - ${book.title}</p>
            <button onclick="window.open('./downloads/${book.file}', '_blank')" 
                    style="margin-top:15px; padding:8px 15px; background:transparent; border:1px solid #00f2ff; color:#fff; cursor:pointer; border-radius:5px;">
                Read PDF
            </button>
        </div>
    `).join('');
}

window.changeLanguage = function() {
    const lang = document.getElementById('languageSelect').value;
    console.log("Language changed to:", lang);
    // Add translation logic here if needed
};