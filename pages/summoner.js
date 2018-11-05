import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Error from 'next/error';

const SummonerTableRow = (props) => {
    let rowColor;
    if (props.match.teamInfo.teamId === 100) {
        rowColor = "row table-primary"
    } else rowColor = "row table-danger";

    let outcome;
    if (props.match.teamInfo.win === 'Win')
        outcome = 'Victory';
    else outcome = 'Defeat';

    const duration = `${parseInt(props.match.matchInfo.gameDuration/60)}m ${props.match.matchInfo.gameDuration%60}s`;
    const stats = props.match.summonerInfo.stats;
    const kda = ((stats.kills + stats.assists)/stats.deaths).toFixed(2);
    const champImgUrl = `${props.url}/img/champion/${props.match.champion.image.full}`;
    const spell1Img = `${props.url}/img/spell/${props.match.summonerInfo.spell1.image.full}`;
    const spell2Img = `${props.url}/img/spell/${props.match.summonerInfo.spell2.image.full}`;
    const cs = (props.match.summonerInfo.stats.totalMinionsKilled/(props.match.matchInfo.gameDuration/60)).toFixed(2);
    const itemList = [];
    for (let i=0; i <= 6; i++) {
        if (props.match.summonerInfo.stats[`item${i}`]) {
            itemList.push(props.match.summonerInfo.stats[`item${i}`]);
        }
    }
    const runeList = [];
    for (let i=0; i <= 5; i++) {
        if (props.match.summonerInfo.stats[`perk${i}`]) {
            const perk = props.match.summonerInfo.stats[`perk${i}`];
            runeList.push({name: perk.name, img:`${props.url}/${perk.icon}`});
        }
    }

    return (
        <div class={rowColor} style={{margin: 5+'px'}} id={props.match.gameId}>
            <div class="col-2 text-center">
                <div style={{paddingTop: 30+'px'}}>
                    {props.match.matchInfo.gameMode}<br/>
                    <b>{outcome}</b><br/>
                    {duration}<br/>
                    ---- <br/>
                    Champ lvl {props.match.summonerInfo.stats.champLevel}<br/>
                    <i>Season {props.match.season}</i>
                </div>
            </div>
            <div class="col-2">
                <div class="row">
                    <p class="text-center">
                        <br/>
                        <img class="rounded-circle img-fluid" src={champImgUrl} /><br/>
                        <b>{props.match.champion.name}</b><br/>
                        <img class="" style={{height: 30+'px'}} src={spell1Img} title={props.match.summonerInfo.spell1.name}/>&nbsp;
                        <img class="" style={{height: 30+'px'}} src={spell2Img} title={props.match.summonerInfo.spell2.name}/>
                    </p>
                </div>
            </div>
            <div class="col-3">
                <div style={{paddingTop: 10+'px'}}>
                    <p><b>Runes:</b>
                        <ul class="list-unstyled">
                            {runeList.map((rune) => (
                                <li>{rune.name}</li>
                            ))}
                        </ul>
                    </p>
                </div>
            </div>
            <div class="col-2 text-center">
                <div style={{paddingTop: 30+'px'}}>
                    <p>{stats.kills} / <span class="text-danger">{stats.deaths}</span> / {stats.assists}<br/>
                        <b>{kda} KDA</b><br/>
                        ----<br/>
                        <i>{props.match.summonerInfo.stats.totalMinionsKilled} Creep kills</i><br/>
                        <i>{cs} cs</i>
                    </p>
                </div>
            </div>
            <div class="col-3 text-left">
                <div style={{paddingTop: 10+'px'}}>
                    <p><b>Items:</b>
                        <ul class="list-unstyled">
                            {itemList.map((item) => (
                                <li>{item}</li>
                            ))}
                        </ul>
                    </p>
                </div>
            </div>
        </div>
    )
};

const SummonerPage = (props) => {
    // Manage errors getting to summoner page
    if (props.error) return <Error statusCode={404} message={props.error}/>;

    let profileImgUrl = '';
    if (props.summoner.profileImg)
        profileImgUrl = `${props.ddUrl}/img/profileicon/${props.summoner.profileImg.image.full}`;

    return (
        <body>
            <div class="container-fluid align-items-center border-top border-bottom">
                <div class="row" style={{margin: 20+'px'}}>
                    <div class="col-1" style={{marginLeft: 20+'px'}}>
                        <img class="rounded-circle" style={{height: 100+'px'}} src={profileImgUrl}/>
                    </div>
                    <div style={{paddingLeft: 20+'px'}}>
                        <h1> {props.summoner.name} </h1>
                        <h3>level {props.summoner.summonerLevel}</h3>
                    </div>
                    <br/>
                </div>
                <div class="container-fluid col-10 align-content-center border-top">
                    <h3>Recent matches: </h3>
                    <div class="row" >
                        <div class="col-2 text-center"><h4>Outcome</h4></div>
                        <div class="col-5 text-center"><h4>Summoner Info</h4></div>
                        <div class="col-2 text-center"><h4>KDA</h4></div>
                        <div class="col-3 text-center"><h4>Items</h4></div>
                    </div>
                    {props.matches.map((match) => (
                        <SummonerTableRow key={match.gameId} match={match} url={props.ddUrl}/>
                    ))}
                </div>
            </div>
        </body>
    )
};

SummonerPage.getInitialProps = async function({req, res}) {
    if (res.error) {
        console.log(res.error);
        return { error: res.error }
    } else {
        console.log(`Matches returned: ${res.data.matches.length}`);
        // console.log(res.data.matches[0]);
         console.log(res.data.summoner);

        return {
            summoner: res.data.summoner,
            matches: res.data.matches,
            ddUrl: res.data.ddUrl
        }
    }
};

export default SummonerPage;