// netlify/functions/log_event.js
// Analytics tracking - uses in-memory storage (persists during warm function)

// Global in-memory storage (persists while function is "warm")
global.analytics = global.analytics || {
    sessions: [],
    captures: [],
    generations: [],
    shares: []
};

function calculateSummary(analytics) {
    const sessions = analytics.sessions.length;
    const captures = analytics.captures.length;
    const generations = analytics.generations.length;
    const shares = analytics.shares.length;
    
    return {
        totalSessions: sessions,
        totalCaptures: captures,
        totalGenerations: generations,
        totalShares: shares,
        captureRate: sessions > 0 ? ((captures / sessions) * 100).toFixed(1) : '0.0',
        generationRate: captures > 0 ? ((generations / captures) * 100).toFixed(1) : '0.0',
        shareRate: generations > 0 ? ((shares / generations) * 100).toFixed(1) : '0.0'
    };
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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { eventType, eventData } = JSON.parse(event.body);
        const timestamp = new Date().toISOString();
        const sessionId = eventData.sessionId || `session_${Date.now()}`;
        
        console.log('📊 Logging event:', eventType, sessionId);
        
        // Log the event to in-memory storage
        if (eventType === 'session_start') {
            global.analytics.sessions.push({ sessionId, timestamp, ...eventData });
            console.log('✅ Session logged. Total sessions:', global.analytics.sessions.length);
        } else if (eventType === 'image_capture') {
            global.analytics.captures.push({ sessionId, timestamp, ...eventData });
            console.log('✅ Capture logged. Total captures:', global.analytics.captures.length);
        } else if (eventType === 'generation_complete') {
            global.analytics.generations.push({ sessionId, timestamp, ...eventData });
            console.log('✅ Generation logged. Total generations:', global.analytics.generations.length);
        } else if (eventType === 'share_click' || eventType === 'save_click') {
            global.analytics.shares.push({ sessionId, timestamp, type: eventType, ...eventData });
            console.log('✅ Share logged. Total shares:', global.analytics.shares.length);
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                currentCounts: {
                    sessions: global.analytics.sessions.length,
                    captures: global.analytics.captures.length,
                    generations: global.analytics.generations.length,
                    shares: global.analytics.shares.length
                }
            })
        };
        
    } catch (error) {
        console.error('❌ Error logging event:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to log event',
                details: error.message 
            })
        };
    }
};
