import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/projects/:id', async (req, res) => {
    const projectId = req.params.id;
    const apiUrl = `https://api.scratch.mit.edu/projects/${projectId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            res.status(response.status).json({ error: `Failed to fetch project details - Status: ${response.status}` });
            return;
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching project details for project ID: ${projectId}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
