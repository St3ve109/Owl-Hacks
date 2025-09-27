import fs from 'fs/promises';
import path from 'path';

// Manually load .env variables
async function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    try {
        const envFileContent = await fs.readFile(envPath, { encoding: 'utf8' });
        envFileContent.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.+)/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                process.env[key] = value;
            }
        });
    } catch (error) {
        console.error('Could not load .env file.', error);
        process.exit(1);
    }
}

async function fetchSchedule() {
    await loadEnv();

    const apiKey = process.env.SPORTRADAR_MLB_API_KEY;
    if (!apiKey) {
        console.error('Error: SPORTRADAR_MLB_API_KEY not found in .env file.');
        process.exit(1);
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const url = `https://api.sportradar.com/mlb/trial/v8/en/games/${year}/${month}/${day}/schedule.json`;

    console.log(`Fetching schedule from: ${url}`);

    const options = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'x-api-key': apiKey
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();

        const dataDir = path.join(process.cwd(), 'public', 'data');
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'schedule.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        console.log(`Successfully fetched and saved schedule to ${filePath}`);
    } catch (err) {
        console.error('Error fetching or saving schedule:', err);
        process.exit(1);
    }
}

fetchSchedule();
