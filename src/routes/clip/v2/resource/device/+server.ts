import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export function GET() {
    return json({ errors: [], data: db.getAllDevices() });
}