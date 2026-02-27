const fs = require('fs').promises;
const ANALYTICS_FILE = '/tmp/analytics.json';

async function getAnalytics() {
    try {
        const data = await fs.readFile(ANALYTICS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { sessions: [], captures: [], generations: [], shares: [] };
    }
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { eventType, eventData } = JSON.parse(event.body);
        const analytics = await getAnalytics();
        
        const timestamp = new Date().toISOString();
        const sessionId = eventData.sessionId || `session_${Date.now()}`;
        
        // Log the event
        if (eventType === 'session_start') {
            analytics.sessions.push({ sessionId, timestamp, ...eventData });
        } else if (eventType === 'image_capture') {
            analytics.captures.push({ sessionId, timestamp, ...eventData });
        } else if (eventType === 'generation_complete') {
            analytics.generations.push({ sessionId, timestamp, ...eventData });
        } else if (eventType === 'share_click' || eventType === 'save_click') {
            analytics.shares.push({ sessionId, timestamp, type: eventType, ...eventData });
        }
        
        await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
