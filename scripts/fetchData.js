const https = require('https');
const fs = require('fs');
const path = require('path');

// Gemini API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

// Function to call Gemini API
async function callGemini(prompt) {
    const requestBody = {
        prompt: { messages: [{ role: 'user', content: prompt }] },
        temperature: 0.7,
        max_output_tokens: 1000,
        candidate_count: 1
    };

    return new Promise((resolve, reject) => {
        const data = JSON.stringify(requestBody);
        const options = {
            hostname: 'gemini.googleapis.com',
            path: `/v1/models/gemini-1.5-mini:generate?key=${encodeURIComponent(GEMINI_API_KEY)}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.candidates && response.candidates[0]) {
                        resolve(response.candidates[0].content);
                    } else {
                        reject(new Error('No response from Gemini'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Function to generate RBSE-style announcements using Gemini
async function generateRBSEData() {
    try {
        console.log('Generating RBSE data with Gemini...');
        const prompt = `Generate 3-5 realistic RBSE (Rajasthan Board of Secondary Education) announcements about exam schedules, results, or important notices. Format as JSON array with objects containing: id (unique string), title, content (detailed), link (realistic URL), date (ISO string). Make them educational and relevant.`;
        
        const response = await callGemini(prompt);
        const announcements = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        
        return {
            source: 'Gemini AI Generated',
            lastUpdated: new Date().toISOString(),
            announcements: announcements.map(item => ({
                ...item,
                id: `rbse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }))
        };
    } catch (error) {
        console.error('RBSE Generation Error:', error.message);
        return null;
    }
}

// Function to generate educational updates using Gemini
async function generateEducationalUpdates() {
    try {
        console.log('Generating educational updates with Gemini...');
        const prompt = `Generate 3-5 educational updates about study tips, new learning resources, or academic news for RBSE students. Format as JSON array with objects containing: id (unique string), title, content (helpful and encouraging), date (ISO string). Focus on Rajasthan education board context.`;
        
        const response = await callGemini(prompt);
        const updates = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        
        return {
            source: 'Gemini AI Generated',
            lastUpdated: new Date().toISOString(),
            updates: updates.map(item => ({
                ...item,
                id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }))
        };
    } catch (error) {
        console.error('Educational Updates Generation Error:', error.message);
        return null;
    }
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
