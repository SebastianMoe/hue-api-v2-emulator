import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function POST() {
    const username = "hue-emulator-user"; 
    // const username = Math.random().toString(36).substring(7);
    
    db.addUser(username); 
    
    return json([{ success: { username: username } }]);
}