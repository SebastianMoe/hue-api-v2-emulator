import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function PUT({ params, request }: RequestEvent) {
    const body = await request.json();
    const result = db.updateGroupedLight(params.id!, body);
    
    if (!result) return json({ errors: ["Resource not found"] }, { status: 404 });

    return json({
        errors: [],
        data: result.map(l => ({ rid: l.id, rtype: "light" }))
    });
}