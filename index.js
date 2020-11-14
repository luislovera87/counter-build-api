const express = require('express');
const app = express();
const https = require('https');
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');

app.use(morgan('dev'));
app.use(cors());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.default.defaults.httpsAgent = httpsAgent

const currentPlayer = async () => {
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

app.get('/', async (req, res) => {
    try {
        const activePlayerData = await currentPlayer();
        let playersListData = await playerList();
        playersListData = playersListData.map(player => {
            player.championSquareImage = `http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${player.championName}.png`;
            return player;
        })
        const gameStatsData = await gameStats();
        res.json({
            activePlayerData: activePlayerData,
            playersListData: playersListData,
            gameStatsData: gameStatsData,
        });
    } catch (error) {
        res.json({
            errorCode: error.code,
            message: error.message
        });
    }
});

// const timeDead = 0;

// setInterval(async () => {
//     try {
//         let currentMatchPlayersData = await playerList();
//         const gameMetrics = await gameStats();
//         currentMatchPlayersData = currentMatchPlayersData.find(player => player.summonerName === "NegroMojitos")
//         const farmPerMinute = currentMatchPlayersData.scores.creepScore / (gameMetrics.gameTime / 60);
//         console.log(farmPerMinute); 
//         timeDead += currentMatchPlayersData.respawnTimer;
//     } catch (error) {
//         console.log('Something happened!');
//     }

// }, 1000 * 30);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started at ${port}`);
})
