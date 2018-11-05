const express = require('express');
const next = require('next');
const LeagueJS = require('leagueJS');
const StaticDataCache = require('./staticData');

const dev = process.env.NODE_ENV !== 'production';
const apiKey = process.env.LEAGUE_API_KEY || 'RGAPI-22c71432-5bc8-4119-a799-bbc3ff75f162';
const platform = process.env.LEAGUE_API_PLATFORM_ID || 'na1';

const DataDragonHelper = require('leaguejs/lib/DataDragon/DataDragonHelper');
DataDragonHelper.storageRoot = [__dirname, './static_data'];

const leagueApi = new LeagueJS(apiKey);

const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const staticDataCache = new StaticDataCache();

// TODO: Make version and local configurable
const version = '8.20.1';
const locale = 'en_US';
const ddUrl = `http://ddragon.leagueoflegends.com/cdn/${version}`;

async function parseMatchInfo(match, summoner) {
    // Map the static champion data
    let champData = staticDataCache.getChampionList().find(champion => {
        return champion.id === match.champion;
    });
    if (champData)
        match.champion = champData;

    // Get individual match info with an other api call
    const matchInfo = await leagueApi.Match.gettingById(match.gameId);
    if (matchInfo) {
        match.matchInfo = matchInfo;
        // Find Participant ID and only keep player stats for this summoner
        const summonerParticipantIdentity = matchInfo.participantIdentities.find(participant => {
            return participant.player.accountId === summoner.accountId;
        });
        const summonerAsParticipant = matchInfo.participants.find(participant => {
            return summonerParticipantIdentity.participantId === participant.participantId;
        });

        // Attach spell static data
        summonerAsParticipant.spell1 = staticDataCache.getSummonerSpellsList().find(spell => {
            return summonerAsParticipant.spell1Id === spell.id;
        });
        summonerAsParticipant.spell2 = staticDataCache.getSummonerSpellsList().find(spell => {
            return summonerAsParticipant.spell2Id === spell.id;
        });

        // Attach item name from static data
        for (let i=0; i <= 6; i++) {
            let itemId = summonerAsParticipant.stats[`item${i}`];
            let item = staticDataCache.getItemList().find(item => {
                return item.id === itemId;
            });
            if (item) {
                summonerAsParticipant.stats[`item${i}`] = item.name;
            } else {
                delete summonerAsParticipant.stats[`item${i}`];
            }
        }

        // Attach rune info
        for (let i=0; i <= 5; i++) {
            let runeId = summonerAsParticipant.stats[`perk${i}`];
            let rune = staticDataCache.getRuneList().find(rune => {
                return rune.id === runeId;
            });
            if (rune)
                summonerAsParticipant.stats[`perk${i}`] = { name: rune.name, icon: rune.icon };
        }

        match.summonerInfo = {...summonerParticipantIdentity, ...summonerAsParticipant};
        // Find and keep only valid team ID
        match.teamInfo = matchInfo.teams.find(team => {
            return team.teamId === match.summonerInfo.teamId;
        });
        return match;
    }
}

async function cacheStaticData() {
    // Download static data
    // TODO: Potentially put this on a very slow timer
    await DataDragonHelper.downloadingStaticDataByLocale(locale, [version]);

    // Load all the data we need from file to memory,
    // this probably isn't ideal in the long term but works for the demo app
    const profileIcons = await DataDragonHelper.gettingProfileiconList(version, locale);
    staticDataCache.setProfileIcons(profileIcons);
    const champList = await DataDragonHelper.gettingFullChampionsList(version, locale);
    staticDataCache.setChampionList(champList);
    const summonerSpells = await DataDragonHelper.gettingSummonerSpellsList(version, locale);
    staticDataCache.setSummonerSpellsList(summonerSpells);
    const itemNames = await DataDragonHelper.gettingItemList(version, locale);
    staticDataCache.setItemList(itemNames);
    const runeInfo = await DataDragonHelper.gettingReforgedRunesList(version, locale);
    staticDataCache.setRuneList(runeInfo);
}

app.prepare()
    .then(async () => { await cacheStaticData() })
    .then(() => {
        const server = express();

        server.get('/s/:name', async (req, res, next) => {
            try {
                // Get Summoner info and match list based on summoner Id
                const summoner = await leagueApi.Summoner.gettingByName(req.params.name);
                let matchList = await leagueApi.Match.gettingListByAccount(summoner.accountId);
                summoner.profileImg = staticDataCache.getProfileIcons().find(icon => {
                    return icon.id === summoner.profileIconId;
                });

                // We're calling an async inside the map so it'll return promises
                const matches = await Promise.all(
                    // Cap to 10 matches for now
                    matchList.matches.slice(0, 10).map(async (match) => {
                        // Format match JSON to include all static data and summoner info
                        return await parseMatchInfo(match, summoner);
                    })
                );

                // Set response data and send it to client
                res.data = {
                    summoner,
                    matches,
                    ddUrl
                };
                return app.render(req, res, '/summoner');
            } catch (err) {
                // console.error(err);
                res.error = err;
                return app.render(req, res, '/summoner');
            }
        });

        server.get('*', (req, res) => {
            return handle(req, res);
        });

        server.listen(port, (err) => {
            if (err) throw err;
            console.log(`Server listening on port ${port}`);
        });

    })
    .catch((err) => {
        console.error(err.stack);
        process.exit(1);
    });
