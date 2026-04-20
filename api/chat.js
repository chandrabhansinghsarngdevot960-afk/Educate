export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
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

    const messages = [{ role: 'system', content: systemPrompt }];

    if (imageData) {
        const textPrompt = question
            ? `${namePrefix}${question}`
            : `${namePrefix}Please analyze this photo and explain everything step-by-step.`;

        messages.push({
            role: 'user',
            content: [
                { type: 'input_text', text: textPrompt },
                { type: 'input_image', image_url: imageData }
            ]
        });
    } else {
        if (!question) {
            return res.status(400).json({ error: 'Please provide a question or an image.' });
        }

        messages.push({ role: 'user', content: `${namePrefix}${question}` });
    }

    try {
        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.35,
                max_tokens: 900,
                n: 1
            })
        });

        const data = await openAiResponse.json();
        if (!openAiResponse.ok) {
            return res.status(openAiResponse.status).json({ error: data.error?.message || 'OpenAI request failed' });
        }

        const content = data.choices?.[0]?.message?.content;
        let message = '';

        if (typeof content === 'string') {
            message = content;
        } else if (Array.isArray(content)) {
            message = content.map(part => part.text || '').join('');
        } else {
            message = String(content || 'I could not generate a response yet.');
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error('AI API error:', error);
        return res.status(500).json({ error: 'Failed to connect to the AI service.' });
    }
}
