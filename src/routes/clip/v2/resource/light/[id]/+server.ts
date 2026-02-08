import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export function GET({ params }: RequestEvent) {
    const light = db.getLight(params.id!);
    if (!light) return json({ errors: ["Resource not found"] }, { status: 404 });
    return json({ errors: [], data: [light] });
}

export async function PUT({ params, request }: RequestEvent) {
    const body = await request.json();
    const result = db.updateLight(params.id!, body);
    
    if (!result) return json({ errors: ["Resource not found"] }, { status: 404 });

    return json({
        errors: [],
        data: [{ rid: params.id, rtype: "light" }]
    });
}