const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleChat(req, res) {
  try {
    const body = await parseBody(req);
    const question = (body.question || '').trim();
    const name = (body.name || '').trim();
    const imageData = body.imageData || null;

    if (!question && !imageData) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Please provide a question or an image.' }));
      return;
    }

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

    const response = await fetch(`https://gemini.googleapis.com/v1/models/gemini-1.5-mini:generate?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data.error?.message || 'Gemini request failed';
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: message }));
      return;
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
      message = 'EDCB Mentor could not generate an answer. Please try again.';
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message }));
  } catch (error) {
    console.error('AI API error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to connect to the AI service.' }));
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  if (pathname === '/api/chat' && req.method === 'POST') {
    handleChat(req, res);
    return;
  }

  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid request');
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`EDCB Mentor server running on http://localhost:${PORT}`);
});
