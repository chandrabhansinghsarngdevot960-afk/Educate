const fs = require('fs');
const path = require('path');

// Content generation system - No external APIs needed
class ContentGenerator {
    constructor() {
        this.templates = {
            rbseAnnouncements: [
                "RBSE {exam} examination scheduled for {date}",
                "New syllabus released for Class {class} {subject}",
                "Result declaration for {exam} expected by {date}",
                "Registration for {exam} opens on {date}",
                "Important notice: {subject} practical exams on {date}",
                "RBSE portal maintenance from {time} to {time}",
                "New model papers available for {class} {subject}",
                "Scholarship applications open for meritorious students",
                "Teacher training program scheduled for {date}",
                "Digital library access enhanced for all classes"
            ],
            studyTips: [
                "Practice {subject} problems daily for 1 hour",
                "Create mind maps for {subject} chapters",
                "Join study groups for better understanding",
                "Take short breaks every 45 minutes while studying",
                "Review previous year's questions for {subject}",
                "Use flashcards for {subject} formulas",
                "Watch educational videos after reading theory",
                "Solve sample papers under exam conditions",
                "Discuss difficult topics with teachers",
                "Maintain a study schedule and stick to it"
            ],
            educationalNews: [
                "New educational app launched for RBSE students",
                "Online learning platform gets 1 lakh new users",
                "Digital classroom initiative expands to rural areas",
                "Mobile library service reaches 500 schools",
                "Coding classes introduced in Class 8 curriculum",
                "Art and craft workshops scheduled for holidays",
                "Science exhibition winners announced",
                "Mathematics Olympiad registration open",
                "English speaking course free for students",
                "Career guidance seminars for Class 12 students"
            ]
        };

        this.subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
        this.classes = ['8', '9', '10', '11', '12'];
        this.exams = ['Mid-term', 'Final', 'Practical', 'Unit Test', 'Board Exam'];
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateDate(offset = 0) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split('T')[0];
    }

    generateTime() {
        const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
        const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours > 12 ? hours - 12 : hours;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    replacePlaceholders(template, data) {
        return template.replace(/{(\w+)}/g, (match, key) => data[key] || match);
    }

    generateRBSEAnnouncement() {
        const template = this.getRandomItem(this.templates.rbseAnnouncements);
        const data = {
            exam: this.getRandomItem(this.exams),
            date: this.generateDate(Math.floor(Math.random() * 30)),
            class: this.getRandomItem(this.classes),
            subject: this.getRandomItem(this.subjects),
            time: this.generateTime()
        };

        return {
            id: `rbse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: this.replacePlaceholders(template, data),
            content: `Important announcement from Rajasthan Board of Secondary Education. ${this.replacePlaceholders(template, data)}. Please check the official website for more details.`,
            link: 'https://rajeduboard.rajasthan.gov.in',
            date: new Date().toISOString(),
            category: 'announcement',
            priority: Math.random() > 0.7 ? 'high' : 'normal'
        };
    }

    generateStudyTip() {
        const template = this.getRandomItem(this.templates.studyTips);
        const data = {
            subject: this.getRandomItem(this.subjects)
        };

        return {
            id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: 'Study Tip of the Day',
            content: this.replacePlaceholders(template, data),
            date: new Date().toISOString(),
            category: 'study-tip',
            subject: data.subject,
            helpful: Math.floor(Math.random() * 50) + 10 // Random helpful count
        };
    }

    generateEducationalNews() {
        const template = this.getRandomItem(this.templates.educationalNews);

        return {
            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: this.replacePlaceholders(template, {}),
            content: `${this.replacePlaceholders(template, {})}. This initiative aims to improve educational outcomes for students across Rajasthan.`,
            date: new Date().toISOString(),
            category: 'news',
            source: 'EDCB Updates'
        };
    }

    generateQuizQuestion(subject) {
        const questionTypes = {
            Mathematics: [
                { q: "What is 15% of 200?", a: "30", options: ["20", "30", "40", "50"] },
                { q: "Solve: 2x + 3 = 7", a: "x = 2", options: ["x = 1", "x = 2", "x = 3", "x = 4"] },
                { q: "Area of circle with radius 7cm?", a: "154 cm²", options: ["44 cm²", "154 cm²", "22 cm²", "77 cm²"] }
            ],
            Science: [
                { q: "What is the chemical symbol for water?", a: "H₂O", options: ["HO", "H₂O", "O₂H", "OH₂"] },
                { q: "Which planet is known as Red Planet?", a: "Mars", options: ["Venus", "Mars", "Jupiter", "Saturn"] },
                { q: "What is the powerhouse of the cell?", a: "Mitochondria", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"] }
            ],
            English: [
                { q: "What is the synonym of 'happy'?", a: "Joyful", options: ["Sad", "Joyful", "Angry", "Tired"] },
                { q: "Choose the correct spelling:", a: "Necessary", options: ["Neccessary", "Necessary", "Necesary", "Necessery"] },
                { q: "What is the past tense of 'go'?", a: "Went", options: ["Goed", "Went", "Going", "Gone"] }
            ]
        };

        const questions = questionTypes[subject] || questionTypes.Mathematics;
        const q = this.getRandomItem(questions);

        return {
            id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            subject: subject,
            question: q.q,
            options: q.options,
            answer: q.a,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
            date: new Date().toISOString()
        };
    }
}

// Function to generate RBSE data
async function generateRBSEData() {
    const generator = new ContentGenerator();
    console.log('Generating RBSE announcements...');

    const announcements = [];
    for (let i = 0; i < 5; i++) {
        announcements.push(generator.generateRBSEAnnouncement());
    }

    return {
        source: 'Self-Generated Content System',
        lastUpdated: new Date().toISOString(),
        announcements: announcements
    };
}

// Function to generate educational updates
async function generateEducationalUpdates() {
    const generator = new ContentGenerator();
    console.log('Generating educational updates...');

    const updates = [];
    for (let i = 0; i < 3; i++) {
        updates.push(generator.generateStudyTip());
    }
    for (let i = 0; i < 2; i++) {
        updates.push(generator.generateEducationalNews());
    }

    return {
        source: 'Self-Generated Content System',
        lastUpdated: new Date().toISOString(),
        updates: updates
    };
}

// Function to generate quiz data
async function generateQuizData() {
    const generator = new ContentGenerator();
    console.log('Generating quiz questions...');

    const quizzes = {};
    generator.subjects.forEach(subject => {
        quizzes[subject] = [];
        for (let i = 0; i < 10; i++) {
            quizzes[subject].push(generator.generateQuizQuestion(subject));
        }
    });

    return {
        lastUpdated: new Date().toISOString(),
        quizzes: quizzes,
        totalQuestions: Object.values(quizzes).flat().length
    };
}

// Function to update main data.js with fresh content
async function updateMainData() {
    const generator = new ContentGenerator();
    console.log('Updating main data.js...');

    // Read current data.js
    const dataPath = path.join(__dirname, '../data.js');
    let currentData = {};

    try {
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        // Extract the edcbData object (simple approach)
        const match = dataContent.match(/const edcbData = ({[\s\S]*?});/);
        if (match) {
            currentData = eval('(' + match[1] + ')');
        }
    } catch (error) {
        console.log('Creating new data structure...');
    }

    // Generate fresh content
    const newsTicker = [];
    for (let i = 0; i < 5; i++) {
        const item = generator.generateRBSEAnnouncement();
        newsTicker.push({
            text: item.title,
            impact: item.category === 'announcement' ? 'Check details' : 'Stay updated'
        });
    }

    // Update exam schedules with random dates
    const examSchedule = [
        { subject: generator.getRandomItem(generator.subjects), date: generator.generateDate(7), time: generator.generateTime(), location: 'Main Center' },
        { subject: generator.getRandomItem(generator.subjects), date: generator.generateDate(14), time: generator.generateTime(), location: 'Zone A' },
        { subject: generator.getRandomItem(generator.subjects), date: generator.generateDate(21), time: generator.generateTime(), location: 'Zone B' }
    ];

    // Update data for each class
    generator.classes.forEach(classNum => {
        if (!currentData.classData) currentData.classData = {};
        if (!currentData.classData[classNum]) currentData.classData[classNum] = {};

        currentData.classData[classNum].Live_News_Ticker = newsTicker.slice(0, 3);
        currentData.classData[classNum].Exam_Schedule = examSchedule;
        currentData.classData[classNum].lastUpdated = new Date().toISOString();
    });

    currentData.config.lastSync = new Date().toISOString();

    // Write back to data.js
    const newDataContent = `// Auto-updating data system
// Last updated: ${new Date().toISOString()}
const edcbData = ${JSON.stringify(currentData, null, 2)};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = edcbData;
}`;

    fs.writeFileSync(dataPath, newDataContent);
    console.log('✅ Main data.js updated successfully!');
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
        console.log('🚀 Starting self-contained content generation...');

        // Generate news feed
        const rbseData = await generateRBSEData();
        const educationalData = await generateEducationalUpdates();
        const quizData = await generateQuizData();

        const newsFeed = {
            lastUpdated: new Date().toISOString(),
            autoUpdate: {
                enabled: true,
                frequency: '6 hours',
                method: 'Self-Contained Generation',
                nextUpdate: new Date(Date.now() + 6*60*60*1000).toISOString()
            },
            sources: {
                rbse: rbseData,
                educational: educationalData,
                quizzes: quizData
            },
            allNews: [
                ...(rbseData?.announcements || []),
                ...(educationalData?.updates || [])
            ].sort((a, b) => new Date(b.date) - new Date(a.date)),
            features: {
                totalNewsItems: (rbseData?.announcements || []).length + (educationalData?.updates || []).length,
                totalQuizQuestions: quizData?.totalQuestions || 0,
                lastQuizUpdate: quizData?.lastUpdated,
                systemStatus: 'Self-Maintaining'
            }
        };

        // Save news feed
        const newsPath = path.join(__dirname, '../news-updates.json');
        fs.writeFileSync(newsPath, JSON.stringify(newsFeed, null, 2));

        // Update main data.js
        await updateMainData();

        console.log('✅ All content updated successfully!');
        console.log(`📊 Generated ${newsFeed.features.totalNewsItems} news items`);
        console.log(`🧠 Generated ${newsFeed.features.totalQuizQuestions} quiz questions`);
        console.log('🕐 Next update:', newsFeed.autoUpdate.nextUpdate);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
