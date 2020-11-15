const express = require('express');
const app = express();
const https = require('https');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');

app.use(morgan('dev'));
app.use(cors());

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});
axios.default.defaults.httpsAgent = httpsAgent;

const activeplayer = async () => {
    try {
        const response = await axios.get('https://127.0.0.1:2999/liveclientdata/activeplayer');
        return response.data;
    } catch (error) {
        return require('./mock/active-player');
    }
}

const playerList = async () => {
    try {
        const response = await axios.get('https://127.0.0.1:2999/liveclientdata/playerlist');
        return response.data;
    } catch (error) {
        return require('./mock/player-list');
    }

}

const playerItems = async (summonerName) => {
    const response = await axios.get(`https://127.0.0.1:2999/liveclientdata/playeritems?summonerName=${summonerName}`)
    return response.data;
}

const gameStats = async () => {
    try {
        const response = await axios.get('https://127.0.0.1:2999/liveclientdata/gamestats');
        return response.data;
    } catch (error) {
        return require('./mock/game-data');
    }

}

// app.get('/', async (req, res) => {
//     try {
//         const activePlayerData = await activeplayer();
//         const playersListData = await playerList();
//         const gameStatsData = await gameStats();
//         res.json({
//             activePlayerData: activePlayerData,
//             playersListData: playersListData,
//             gameStatsData: gameStatsData
//         });
//     } catch (error) {
//         res.json({
//             errorCode: error.code,
//             message: error.message
//         });
//     }
// });

// const timeDead = 0;

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started at ${port}`);
    io.on('connection', socket => {
        console.log(`Connected to client!!`);
        setInterval(async () => {
            try {
                const activePlayerData = await activeplayer();
                const playersListData = await playerList();
                const gameStatsData = await gameStats();
                const data = {
                    activePlayerData: activePlayerData,
                    playersListData: playersListData,
                    gameStatsData: gameStatsData
                }
                socket.emit('data', data);
            } catch (error) {
                console.log('Something happened!');
            }

        }, 1000 * 1);

    });

});