// netlify/functions/get_analytics.js
// Retrieves analytics from Netlify Blobs
const { getStore } = require('@netlify/blobs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'looks2025';

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const password = event.queryStringParameters?.password;
    if (password !== ADMIN_PASSWORD) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid password' })
        };
    }

    try {
        // Get blob store
        const store = getStore('analytics');
        
        // Get data
        let analytics;
        try {
            const data = await store.get('data');
            analytics = data ? JSON.parse(data) : {
                sessions: [],
                captures: [],
                generations: [],
                shares: []
            };
        } catch (e) {
            analytics = {
                sessions: [],
                captures: [],
                generations: [],
                shares: []
            };
        }
        
        const sessions = analytics.sessions.length;
        const captures = analytics.captures.length;
        const generations = analytics.generations.length;
        const shares = analytics.shares.length;
        
        const summary = {
            totalSessions: sessions,
            totalCaptures: captures,
            totalGenerations: generations,
            totalShares: shares,
            captureRate: sessions > 0 ? ((captures / sessions) * 100).toFixed(1) : '0.0',
            generationRate: captures > 0 ? ((generations / captures) * 100).toFixed(1) : '0.0',
            shareRate: generations > 0 ? ((shares / generations) * 100).toFixed(1) : '0.0'
        };
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ...analytics,
                summary
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to retrieve analytics',
                details: error.message 
            })
        };
    }
};
