export interface HueIdentifier {
    rid: string;
    rtype: string;
}

export interface HueService {
    rid: string;
    rtype: string;
}

export interface HueDevice {
    id: string;
    metadata: { name: string; archetype: string };
    services: HueService[];
    product_data?: any; 
    type: 'device';
}

export interface HueRoom {
    id: string;
    metadata: { name: string; archetype: string };
    children: HueIdentifier[]; 
    services: HueService[]; 
    type: 'room';
}

export interface HueLightState {
    on?: { on: boolean };
    dimming?: { brightness: number };
    color?: { xy: { x: number; y: number } };
}

export interface HueLight {
    id: string; 
    owner: { rid: string; rtype: string }; 
    metadata: { name: string; archetype: string };
    on: { on: boolean };
    dimming?: { brightness: number };
    color?: { xy: { x: number; y: number } };
    render?: { hex: string };
    type: 'light';
}

export interface HueGroupedLight {
    id: string;
    id_v1: string;
    owner: { rid: string; rtype: string };
    on?: { on: boolean };
    dimming?: { brightness: number };
    alert?: { action_values: string[] };
    signaling?: { signal_values: string[] };
    dynamics?: any;
    type: 'grouped_light';
}

export interface HueDbSchema {
    users: string[];
    devices: HueDevice[];
    rooms: HueRoom[];
    lights: Map<string, HueLight>; 
}