import { json, type Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${event.request.method} ${event.url.pathname}`);
    if (event.url.pathname.startsWith('/clip/v2')) {
        const apiKey = event.request.headers.get('hue-application-key');

        if (!apiKey || !db.isValidUser(apiKey)) {
            return json(
                { errors: ['Unauthorized - Invalid API Key'] }, 
                { status: 403 }
            );
        }
    }

    const response = await resolve(event);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'hue-application-key, Content-Type');
    
    if (event.request.method === 'OPTIONS') {
        return new Response(null, { headers: response.headers });
    }

    return response;
};