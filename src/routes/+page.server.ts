import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        rooms: db.getAllRooms(),
        devices: db.getAllDevices(),
        lights: db.getAllLights()
    };
};
