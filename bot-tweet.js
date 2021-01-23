require('dotenv').config();
const config = require('./config');
const twit = require('twit');
const twitter = new twit(config);

const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function post(){
    client.connect();
    client.query(`
        SELECT phrase, author
        FROM phrases
        TABLESAMPLE BERNOULLI(0.1)
        LIMIT 1;`, 
        (err, res) => {
            if (err) throw err.stack;
            
            if (res.rows){
                let tweet = res.rows[0].phrase;
                if (res.rows[0].author){
                    tweet += ' - ' + res.rows[0].author;
                }
                tweet += ' #pensador';

                if(tweet.length <= 280){
                    twitter.post(
                        'statuses/update',
                        {'status': tweet}
                    )
                }
            }
            client.end();            
    });
}

post()
