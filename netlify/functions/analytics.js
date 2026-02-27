// netlify/functions/analytics.js
// Single function that handles BOTH logging AND retrieving

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'looks2025';

// In-memory storage (resets on cold start, but simple and works)
let analytics = {
    sessions: [],
    captures: [],
    generations: [],
    shares: []
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // GET = retrieve analytics (for admin)
    if (event.httpMethod === 'GET') {
        const password = event.queryStringParameters?.password;
        if (password !== ADMIN_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' })
            };
        }

        const sessions = analytics.sessions.length;
        const captures = analytics.captures.length;
        const generations = analytics.generations.length;
        const shares = analytics.shares.length;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ...analytics,
                summary: {
                    totalSessions: sessions,
                    totalCaptures: captures,
                    totalGenerations: generations,
                    totalShares: shares,
                    captureRate: sessions > 0 ? ((captures / sessions) * 100).toFixed(1) : '0.0',
                    generationRate: captures > 0 ? ((generations / captures) * 100).toFixed(1) : '0.0',
                    shareRate: generations > 0 ? ((shares / generations) * 100).toFixed(1) : '0.0'
                }
            })
        };
    }

    // POST = log event
    if (event.httpMethod === 'POST') {
        try {
            const { eventType, eventData } = JSON.parse(event.body);
            const timestamp = new Date().toISOString();

            if (eventType === 'session_start') {
                analytics.sessions.push({ ...eventData, timestamp });
            } else if (eventType === 'image_capture') {
                analytics.captures.push({ ...eventData, timestamp });
            } else if (eventType === 'generation_complete') {
                analytics.generations.push({ ...eventData, timestamp });
            } else if (eventType === 'share_click' || eventType === 'save_click') {
                analytics.shares.push({ ...eventData, timestamp, type: eventType });
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    counts: {
                        sessions: analytics.sessions.length,
                        captures: analytics.captures.length,
                        generations: analytics.generations.length,
                        shares: analytics.shares.length
                    }
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
