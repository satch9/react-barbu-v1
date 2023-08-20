import express from 'express';
import http from 'http';
import { ServerSocket } from './socket';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 4003;

/** Server handling */
const httpServer = http.createServer(app);

/** Start the socket*/
new ServerSocket(httpServer);


// Servir les fichiers statiques depuis le dossier 'dist'
app.use(express.static(path.join(__dirname, 'dist')));


/** Log the request */
app.use((req, res, next) => {
    console.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        console.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/** Healthcheck */
app.get('/ping', (_req, res) => {
    return res.status(200).json({ hello: 'world!' });

});


/** Error handling */
app.use((_req, res) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});