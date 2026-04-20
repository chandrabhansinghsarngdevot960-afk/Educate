export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDpKP6AShxDF7kh2chMTedtE8hdzUAf1Jo';
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const question = (body.question || '').trim();
    const name = (body.name || '').trim();
    const imageData = body.imageData || null;

    const systemPrompt = `You are EDCB Mentor, a legit study friend. Answer study questions step-by-step. If a student uploads a photo, analyze it instantly. Talk casually, use students' names (if provided), and be encouraging. Avoid robotic formal language. Your job is to help them understand, not just pass.`;
    const namePrefix = name ? `Hey ${name}, ` : '';

    if (!question && !imageData) {
        return res.status(400).json({ error: 'Please provide a question or an image.' });
    }

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
        prompt: {
            messages: [promptMessage, userMessage]
        },
        temperature: 0.35,
        max_output_tokens: 900,
        candidate_count: 1
    };

    try {
        const response = await fetch('https://gemini.googleapis.com/v1/models/gemini-1.5-mini:generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GEMINI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Gemini request failed' });
        }

        let message = '';
        const candidate = data?.candidates?.[0];
        if (candidate) {
            if (typeof candidate?.content === 'string') {
                message = candidate.content;
            } else if (Array.isArray(candidate?.content)) {
                message = candidate.content.map(item => item.text || '').join('');
            } else if (candidate?.content?.text) {
                message = candidate.content.text;
            }
        }

        if (!message) {
            message = 'EDCB Mentor is ready but could not generate the answer. Please try again.';
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error('AI API error:', error);
        return res.status(500).json({ error: 'Failed to connect to the AI service.' });
    }
}
