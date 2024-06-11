import express from 'express';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'stream';
import got from 'got';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 6640;

const allowedOrigins = ['https://academy.europa.eu', 'http://localhost'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight requests
app.options('*', cors());

// Middleware to parse JSON bodies
app.use(express.json());

const languageVoiceMap = {
    'EN': 'Bronagh',
    'ES': 'Pilar',
    'FR': 'Brigitte',
    'DE': 'Monika',
    'IT': 'Ornella',
    'BG': 'Desislava',
    'CS': 'Barbora',
    'DA': 'Inger',
    'EL': 'Eleni',
    'ET': 'Pille',
    'FI': 'Saara',
    'GA': 'Aoife',
    'HU': 'Krisztina',
    'HR': 'Jasna',
    'IS': 'Steinunn',
    'LV': 'Kristaps',
    'LT': 'Jurga',
    'MK': 'Nina',
    'MT': 'Corazon',
    'NO': 'Sonja',
    'NL': 'Fransje',
    'PL': 'Magda',
    'PT': 'Ines',
    'RO': 'Alina',
    'SK': 'Zuzana',
    'SL': 'Mojca',
    'SV': 'Hedvig',
    'SR': 'Milica',
    'TR': 'Leyla',

    // Add other language-voice mappings here...
    // 'language_code': 'voice_name'
};

app.post('/synthesize', async (req, res) => {
    console.log('Request body:', req.body);

    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and targetLanguage are required' });
    }

    const voice = languageVoiceMap[targetLanguage.toUpperCase()];

    if (!voice) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const APIKEY = 'TK4jrT4FMk8pPXG3hhLgw4tRIOsHjcQn88R6MId0';

    try {
        res.setHeader('Content-Type', 'audio/m4a');

        await pipeline(
            Readable.from([text]),
            got.stream.post(
                `https://api.narakeet.com/text-to-speech/m4a?voice=${voice}`,
                {
                    headers: {
                        'accept': 'application/octet-stream',
                        'x-api-key': APIKEY,
                        'content-type': 'text/plain'
                    }
                }
            ),
            res
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
