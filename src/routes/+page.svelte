<script lang="ts">
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import type { HueLight, HueRoom, HueDevice } from '$lib/types';

    export let data: {
        rooms: HueRoom[];
        devices: HueDevice[];
        lights: HueLight[];
    };

    function getCssColor(light: HueLight) {
        if (!light.on?.on) return '#222'; 
        if (light.render?.hex) return light.render.hex;
        
        const x = light.color?.xy?.x || 0.5;
        const y = light.color?.xy?.y || 0.5;
        const bri = light.dimming?.brightness || 100;
        
        const hue = (x * 360) % 360; 
        const sat = y * 100;
        return `hsl(${hue}, ${sat}%, ${bri / 2 + 20}%)`;
    }

    onMount(() => {
        const interval = setInterval(() => {
            invalidateAll();
        }, 1000);
        return () => clearInterval(interval);
    });
</script>

<div class="app">
    <h1>Hue V2 Emulator</h1>
    <p>API Endpoint: <code>/clip/v2/resource/...</code></p>

    <div class="rooms-container">
        {#each data.rooms as room}
            <div class="room">
                <div class="room-header">
                    <h2>{room.metadata.name}</h2>
                    <span class="archetype">{room.metadata.archetype}</span>
                    <br>
                    <small>Group ID: {room.services[0].rid}</small>
                </div>

                <div class="lights-grid">
                    {#each room.children as child}
                        {@const device = data.devices.find(d => d.id === child.rid)}
                        {@const lightService = device?.services.find(s => s.rtype === 'light')}
                        {@const light = lightService ? data.lights.find(l => l.id === lightService.rid) : null}

                        {#if light}
                            <div class="light-card">
                                <div class="bulb" 
                                     style="background-color: {getCssColor(light)}; 
                                            box-shadow: 0 0 15px {light.on.on ? getCssColor(light) : 'none'}">
                                </div>
                                <div class="info">
                                    <strong>{light.metadata.name}</strong>
                                    <div class="status">
                                        {light.on.on ? 'AN' : 'AUS'} 
                                        {#if light.on.on}
                                            • {light.dimming?.brightness.toFixed(0)}%
                                        {/if}
                                    </div>
                                    <small class="id">ID: {light.id.split('-')[0]}...</small>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(body) { background: #101010; color: #eee; font-family: system-ui, sans-serif; margin: 0; }
    .app { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    code { background: #333; padding: 2px 6px; border-radius: 4px; color: #8fd; }
    
    .rooms-container { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 2rem; }
    
    .room { 
        background: #1a1a1a; 
        border: 1px solid #333; 
        border-radius: 16px; 
        padding: 1.5rem; 
        flex: 1; 
        min-width: 300px;
    }
    
    .room-header { margin-bottom: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
    .room-header h2 { margin: 0; font-size: 1.5rem; }
    .archetype { color: #888; text-transform: capitalize; font-size: 0.9rem; }
    
    .lights-grid { display: flex; flex-direction: column; gap: 1rem; }
    
    .light-card { 
        display: flex; 
        align-items: center; 
        gap: 1rem; 
        background: #252525; 
        padding: 1rem; 
        border-radius: 12px;
    }
    
    .bulb { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #444; transition: all 0.3s; }
    .info { display: flex; flex-direction: column; }
    .status { font-size: 0.9rem; color: #aaa; }
    .id { font-size: 0.7rem; color: #555; font-family: monospace; }
</style>