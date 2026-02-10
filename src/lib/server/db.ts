import type { HueDbSchema, HueLight, HueRoom, HueDevice, HueGroupedLight } from '$lib/types';
import { xyToHex } from '$lib/color';

const BRIDGE_HOME_GROUP_ID = "79e913d1-0f05-421f-9283-55d447a5cd99";

const rawDevices: HueDevice[] = [
    {
        id: "ad13a94c-927d-4b72-8a13-0ae6e74e5f40", 
        metadata: { name: "Hue go", archetype: "table_shade" },
        services: [{ rid: "31eae248-c6bd-4a30-9229-5147666bdf99", rtype: "light" }],
        type: "device"
    },
    {
        id: "5234149b-5aa5-4f25-80a1-dc6c5d5551ef", 
        metadata: { name: "Hue white lamp 1", archetype: "double_spot" },
        services: [{ rid: "23188abe-8de1-471d-bd04-33a5e7958a0e", rtype: "light" }],
        type: "device"
    },
    {
        id: "d5acfb0d-66bd-4060-984d-243e6c8538c5", 
        metadata: { name: "Hue white lamp 2", archetype: "double_spot" },
        services: [{ rid: "466311cd-0eff-447b-9cdb-367b49e9f8ec", rtype: "light" }],
        type: "device"
    },
    {
        id: "dfdf381d-b618-4421-981f-be513f09929b", 
        metadata: { name: "Hue Play 2", archetype: "hue_play" },
        services: [{ rid: "63e72a84-2afe-49e6-8387-13346efb4940", rtype: "light" }],
        type: "device"
    },
    {
        id: "f350c353-ba95-4c5a-af7c-f82230359b22",
        metadata: { name: "Hue Play 1", archetype: "hue_play" },
        services: [{ rid: "c65ed1ac-da7c-4427-9885-61cca26efcac", rtype: "light" }],
        type: "device"
    }
];

const rawRooms: HueRoom[] = [
    {
        id: "27c4e017-2f51-44ee-968c-3b76f1e84c58", 
        metadata: { name: "Living Room", archetype: "living_room" },
        children: [
            { rid: "f350c353-ba95-4c5a-af7c-f82230359b22", rtype: "device" },
            { rid: "dfdf381d-b618-4421-981f-be513f09929b", rtype: "device" },
            { rid: "ad13a94c-927d-4b72-8a13-0ae6e74e5f40", rtype: "device" }
        ],
        services: [{ rid: "56f4a668-49ca-4920-be70-fe4769c844b9", rtype: "grouped_light" }],
        type: "room"
    },
    {
        id: "43744ecb-d044-4e89-b2f5-7dfd86a2ed75", 
        metadata: { name: "Office", archetype: "living_room" },
        children: [
            { rid: "d5acfb0d-66bd-4060-984d-243e6c8538c5", rtype: "device" },
            { rid: "a1a6f4ec-bfa8-4395-82c8-8a251690a90c", rtype: "device" }
        ],
        services: [{ rid: "a20e7c1f-4444-452a-a4ea-86ee92f5c085", rtype: "grouped_light" }],
        type: "room"
    },
    {
        id: "afc2e58b-fd36-45a5-bc23-a0934b03ef3e", 
        metadata: { name: "Bedroom", archetype: "bedroom" },
        children: [
            { rid: "5234149b-5aa5-4f25-80a1-dc6c5d5551ef", rtype: "device" },
            { rid: "d8fd8ba7-866b-44fe-b654-6b4ab8bfc1dd", rtype: "device" }
        ],
        services: [{ rid: "45dcde14-14ad-488d-9312-6ecde3c0ed93", rtype: "grouped_light" }],
        type: "room"
    }
];

const lightsMap = new Map<string, HueLight>();

function createLightState(serviceId: string, ownerId: string, name: string): HueLight {
    const defaultX = 0.45;
    const defaultY = 0.41; 
    const defaultBri = 100;
    
    return {
        id: serviceId,
        owner: { rid: ownerId, rtype: 'device' },
        metadata: { name: name, archetype: "unknown" },
        on: { on: false }, 
        dimming: { brightness: defaultBri },
        color: { xy: { x: defaultX, y: defaultY } }, 
        render: { hex: xyToHex(defaultX, defaultY, defaultBri) },
        type: 'light'
    };
}

rawDevices.forEach(dev => {
    const lightService = dev.services.find(s => s.rtype === 'light');
    if (lightService) {
        lightsMap.set(lightService.rid, createLightState(lightService.rid, dev.id, dev.metadata.name));
    }
});

const dbData: HueDbSchema = {
    users: [],
    devices: rawDevices,
    rooms: rawRooms,
    lights: lightsMap
};

// --- API Logic ---

export const db = {
    // Auth
    addUser: (username: string) => dbData.users.push(username),
    isValidUser: (apiKey: string) => dbData.users.includes(apiKey),

    // Getters
    getAllDevices: () => dbData.devices,
    getAllRooms: () => dbData.rooms,
    getAllLights: () => Array.from(dbData.lights.values()),
    getGroupedLights: (): HueGroupedLight[] => {
        const groupedLights: HueGroupedLight[] = [];

        dbData.rooms.forEach(room => {
            const serviceId = room.services.find(s => s.rtype === 'grouped_light')?.rid;
            if (serviceId) {
                groupedLights.push({
                    id: serviceId,
                    id_v1: `/groups/${Math.floor(Math.random() * 100)}`, // Fake v1 ID
                    owner: { rid: room.id, rtype: 'room' },
                    on: { on: false }, // Simplification
                    dimming: { brightness: 0 },
                    alert: { action_values: ["breathe"] },
                    signaling: { signal_values: ["no_signal", "on_off"] },
                    type: 'grouped_light'
                });
            }
        });

        groupedLights.push({
            id: BRIDGE_HOME_GROUP_ID,
            id_v1: "/groups/0",
            owner: {
                rid: "0f5af257-b711-4f99-9fe6-f85bcbfa2af4", // Random/Fixed ID for bridge
                rtype: "bridge_home"
            },
            on: { on: Array.from(dbData.lights.values()).some(l => l.on.on) },
            dimming: { brightness: 100 },
            alert: { action_values: ["breathe"] },
            signaling: { signal_values: ["alternating", "no_signal", "on_off", "on_off_color"] },
            type: 'grouped_light'
        });

        return groupedLights;
    },
    getLight: (id: string) => dbData.lights.get(id),

    // Setter
    updateLight: (id: string, update: any) => {
        const light = dbData.lights.get(id);
        if (!light) return null;

        if (update.on) light.on = { ...light.on, ...update.on };
        if (update.dimming) light.dimming = { ...light.dimming, ...update.dimming };
        if (update.color) light.color = { ...light.color, ...update.color };

        if (light.on.on && light.color?.xy && light.dimming) {
            light.render = { 
                hex: xyToHex(light.color.xy.x, light.color.xy.y, light.dimming.brightness) 
            };
        } else if (!light.on.on) {
            light.render = { hex: '#222222' };
        }

        return light;
    },

    updateGroupedLight: (groupedLightId: string, update: any) => {
        // Special Case: Bridge Home (All Lights)
        if (groupedLightId === BRIDGE_HOME_GROUP_ID) {
             const allLights = Array.from(dbData.lights.values());
             const updatedLights: HueLight[] = [];
             allLights.forEach(l => {
                 const res = db.updateLight(l.id, update);
                 if (res) updatedLights.push(res);
             });
             return updatedLights;
        }

        const room = dbData.rooms.find(r => r.services.some(s => s.rid === groupedLightId));
        if (!room) return null;

        const affectedLights: HueLight[] = [];

        room.children.forEach(child => {
            if (child.rtype === 'device') {
                const device = dbData.devices.find(d => d.id === child.rid);
                if (device) {
                    const lightService = device.services.find(s => s.rtype === 'light');
                    if (lightService) {
                        const updated = db.updateLight(lightService.rid, update);
                        if (updated) affectedLights.push(updated);
                    }
                }
            }
        });

        return affectedLights;
    }
};