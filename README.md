# Hue API v2 Emulator

A simple emulator for the Philips Hue API v2, built with SvelteKit.

## Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Build Project:**

   To prepare the application for production execution, run the build command:

   ```bash
   npm run build
   ```

3. **Start Emulator:**

   Start the emulator using the 'preview' command. This starts the server and makes it available on the network (via the `--host` configuration in package.json).

   ```bash
   npm run preview
   ```

## Usage in Browser

After running `npm run preview`, the emulator is accessible by default at:

**http://localhost:4173/**

(The port may vary, check the terminal output).

On the homepage, you will find a user interface to control and visualize the simulated lights and devices.

## API Usage

The emulator provides various endpoints of the Hue API v2. The base path is `/clip/v2/resource`.

### Authentication & Setup

To interact with the API, you first need to obtain a username (application key) and use it in your request headers.

1. **Get Username:**

   POST to `/api` to generate a username.
   ```http
   POST /api
   ```
   **Response:**
   ```json
   [
       {
           "success": {
               "username": "hue-emulator-user"
           }
       }
   ]
   ```

2. **Set Request Header:**

   For all subsequent requests to `/clip/v2/resource/...`, you must include the `hue-application-key` header with the username obtained above.

   | Header Key | Value |
   | :--- | :--- |
   | `hue-application-key` | `hue-emulator-user` |

### Discovering Devices & Lights

To control lights, you first need their Resource IDs (`rid`). You can find these by listing all devices.

**Request:**
```http
GET /clip/v2/resource/device
```

**Response Snippet:**
```json
{
    "errors": [],
    "data": [
        {
            "id": "ad13a94c-927d-4b72-8a13-0ae6e74e5f40",
            "metadata": {
                "name": "Hue go",
                "archetype": "table_shade"
            },
            "services": [
                {
                    "rid": "31eae248-c6bd-4a30-9229-5147666bdf99",
                    "rtype": "light"
                }
            ],
            "type": "device"
        },
        ...
    ]
}
```
In this example, the `rid` for the light service of "Hue go" is `31eae248-c6bd-4a30-9229-5147666bdf99`. You use this ID to control the light.

### Controlling a Light

To turn on a light, dim it to 50%, and set the color to blue, send a `PUT` request to the light resource.

**Request:**
```http
PUT /clip/v2/resource/light/31eae248-c6bd-4a30-9229-5147666bdf99
Headers:
  hue-application-key: hue-emulator-user
```

**Body:**
```json
{
    "on": {
        "on": true
    },
    "dimming": {
        "brightness": 50.0
    },
    "color": {
        "xy": {
            "x": 0.167,
            "y": 0.04
        }
    }
}
```

### Available Endpoints

*   **Devices**: `GET /clip/v2/resource/device`
*   **Rooms**: `GET /clip/v2/resource/room`
*   **Grouped Lights**: `GET /clip/v2/resource/grouped_light`
*   **Lights**: `GET /clip/v2/resource/light/[id]`

## Development

To start the development server with hot-reloading:

```bash
npm run dev
```
