require('dotenv').config()
const { Client } = require('pg')
const twit = require('twit')
const config = require('./config')

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
const twitter = new twit(config);

function coin_toss(skew=0.5){
    return Math.random() < skew;
}

function post(){
    let tweet_pt = 'Esse perfil segue todos os protocolos!!';
    let tweet_en = "'Dude, I'm following all protocols!'";
    
    client.connect();
    client.query(`
        SELECT *
        FROM phrases
        TABLESAMPLE BERNOULLI(0.1)
        LIMIT 1;`, 
        (err, res) => {
            if (err) throw err.stack;

            let tweet = ''
            if (coin_toss(0.2)){
                tweet += tweet_pt ? tweet_pt : tweet_en;
            } else {
                tweet = res.rows[0].phrase;
                if (res.rows[0].author){
                    tweet += ' - ' + res.rows[0].author;
                }
                tweet += ' #pensador.com';
            }

            if(tweet.length <= 280){
                twitter.post(
                    'statuses/update',
                    {'status': tweet}
                )
            }

            client.end();            
    });
}

post()
