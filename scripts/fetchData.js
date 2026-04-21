const fs = require('fs');
const path = require('path');

// Local content templates and data
const RBSE_TEMPLATES = [
    {
        title: "RBSE {exam} Exam Schedule Released",
        content: "The Rajasthan Board of Secondary Education has released the schedule for {exam} examinations. Students are advised to check the official website for detailed timetable and preparation guidelines. Important dates: Registration starts {date1}, Last date for submission {date2}.",
        link: "https://rajeduboard.rajasthan.gov.in/exam-schedule"
    },
    {
        title: "RBSE Result Declaration - {class} Class",
        content: "Results for {class} class examinations have been declared. Students can check their results on the official RBSE portal. The overall pass percentage is {percentage}%. Congratulations to all successful students!",
        link: "https://rajeduboard.rajasthan.gov.in/results"
    },
    {
        title: "Important Notice: RBSE Fee Structure Update",
        content: "RBSE has updated the fee structure for various examinations and services. New fees effective from {date}. Students are requested to pay fees through official channels only.",
        link: "https://rajeduboard.rajasthan.gov.in/fees"
    },
    {
        title: "RBSE Syllabus Revision for {subject}",
        content: "The syllabus for {subject} has been revised for the upcoming academic session. New topics include {topics}. Teachers and students should refer to the updated curriculum.",
        link: "https://rajeduboard.rajasthan.gov.in/syllabus"
    },
    {
        title: "RBSE Scholarship Program {year}",
        content: "Applications are now open for RBSE scholarship programs for meritorious students. Eligible students can apply online. Last date: {date}. Various categories available including merit-based and need-based scholarships.",
        link: "https://rajeduboard.rajasthan.gov.in/scholarships"
    }
];

const STUDY_TIPS = [
    {
        title: "Effective Study Techniques for {subject}",
        content: "Master {subject} with these proven techniques: 1) Practice daily problems, 2) Create mind maps, 3) Teach concepts to others, 4) Use mnemonic devices, 5) Regular revision. Focus on understanding rather than memorization."
    },
    {
        title: "Time Management for Board Exams",
        content: "Plan your study schedule wisely: Allocate 2 hours daily for each subject, include breaks, set achievable goals, track progress, and maintain work-life balance. Remember: Quality over quantity!"
    },
    {
        title: "Memory Enhancement Techniques",
        content: "Improve your memory with: Spaced repetition, active recall, visualization, association techniques, and adequate sleep. Regular exercise and healthy diet also boost brain function."
    },
    {
        title: "Digital Learning Resources",
        content: "Explore free online resources: Khan Academy, YouTube educational channels, NCERT digital library, Quizlet for flashcards, and educational apps. Combine digital and traditional learning methods."
    },
    {
        title: "Exam Stress Management",
        content: "Handle exam stress with: Deep breathing exercises, regular physical activity, healthy eating, adequate sleep (7-8 hours), and positive visualization. Remember, moderate stress can improve performance."
    }
];

const SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "Social Science", "Physics", "Chemistry", "Biology"];
const CLASSES = ["10th", "12th", "9th", "11th"];
const EXAMS = ["Board", "Mid-term", "Final", "Practical", "Internal Assessment"];
const TOPICS = ["Advanced Calculus", "Organic Chemistry", "Literature Analysis", "Historical Events", "Scientific Methods"];

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function formatDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

function generateUniqueId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Generate RBSE announcements
function generateRBSEData() {
    const announcements = [];
    const numAnnouncements = Math.floor(Math.random() * 3) + 2; // 2-4 announcements

    for (let i = 0; i < numAnnouncements; i++) {
        const template = getRandomElement(RBSE_TEMPLATES);
        let title = template.title;
        let content = template.content;

        // Replace placeholders
        title = title.replace('{exam}', getRandomElement(EXAMS));
        title = title.replace('{class}', getRandomElement(CLASSES));
        title = title.replace('{subject}', getRandomElement(SUBJECTS));
        title = title.replace('{year}', new Date().getFullYear());

        content = content.replace('{exam}', getRandomElement(EXAMS));
        content = content.replace('{class}', getRandomElement(CLASSES));
        content = content.replace('{subject}', getRandomElement(SUBJECTS));
        content = content.replace('{percentage}', Math.floor(Math.random() * 20) + 80 + '%');
        content = content.replace('{date1}', formatDate(Math.floor(Math.random() * 30)));
        content = content.replace('{date2}', formatDate(Math.floor(Math.random() * 30) + 30));
        content = content.replace('{date}', formatDate(Math.floor(Math.random() * 60)));
        content = content.replace('{topics}', getRandomElement(TOPICS) + ', ' + getRandomElement(TOPICS));

        announcements.push({
            id: generateUniqueId('rbse'),
            title: title,
            content: content,
            link: template.link,
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last week
        });
    }

    return {
        source: 'RBSE Auto-Generated',
        lastUpdated: new Date().toISOString(),
        announcements: announcements
    };
}

// Generate educational updates
function generateEducationalUpdates() {
    const updates = [];
    const numUpdates = Math.floor(Math.random() * 3) + 2; // 2-4 updates

    for (let i = 0; i < numUpdates; i++) {
        const template = getRandomElement(STUDY_TIPS);
        let title = template.title;
        let content = template.content;

        // Replace placeholders
        title = title.replace('{subject}', getRandomElement(SUBJECTS));

        updates.push({
            id: generateUniqueId('edu'),
            title: title,
            content: content,
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    return {
        source: 'Educational Auto-Generated',
        lastUpdated: new Date().toISOString(),
        updates: updates
    };
}

// Function to generate news feed
async function generateNewsFeed() {
    const rbseData = await generateRBSEData();
    const githubData = await generateEducationalUpdates();
    
    const newsFeed = {
        lastUpdated: new Date().toISOString(),
        autoUpdate: {
            enabled: true,
            frequency: '6 hours',
            nextUpdate: new Date(Date.now() + 6*60*60*1000).toISOString()
        },
        sources: {
            rbse: rbseData,
            github: githubData
        },
        allNews: [
            ...(rbseData?.announcements || []),
            ...(githubData?.updates || [])
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
    };
    
    return newsFeed;
}

// Main function
async function main() {
    try {
        console.log('Starting automated data fetch...');
        
        // Generate news feed
        const newsFeed = await generateNewsFeed();
        
        // Save to file
        const filePath = path.join(__dirname, '../news-updates.json');
        fs.writeFileSync(filePath, JSON.stringify(newsFeed, null, 2));
        
        console.log('✅ Data updated successfully!');
        console.log('📰 News feed updated at:', newsFeed.lastUpdated);
        console.log('⏰ Next update:', newsFeed.autoUpdate.nextUpdate);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
