require('dotenv').config()
const config = require('./config')
const twit = require('twit')
const twitter = new twit(config)

function follow_user(user_id){
    twitter
        .post(
            'friendships/create',
            {user_id: user_id,
            follow: false}
        )
        .then(result => {
            let tweet_pt = `Seguindo @${result.data.screen_name}`
            let tweet_en = `Following @${result.data.screen_name}!!`
            let tweet = coin_toss ? tweet_pt : tweet_en
            twitter.post(
                'statuses/update',
                {'status': tweet}
            )
            console.log(tweet)
        })
        .catch(error => {
            console.log('follow_user')
            console.log(error)
        })
}

function unfollow_user(user_id){
    twitter
        .post(
            'friendships/destroy',
            {user_id: user_id}
        )
        .then(result => {
            let tweet_pt = `Ignorando @${result.data.screen_name}`
            let tweet_en = `Unfollowing @${result.data.screen_name}`
            let tweet = coin_toss ? tweet_pt : tweet_en
            console.log(tweet)
        })
        .catch(error => {
            console.log('unfollow_user')
            console.log(error)
        })
}

function unfollow_non_protocol(cursor='-1'){
    twitter
        .get(
            'friends/list', 
            {screen_name: 'SirProtocolBot',
            cursor: cursor, 
            skip_status: true,
            include_user_entities: false}
        )
        .then(result => {
            let friends = result.data
            for(let user of friends.users){
                if(!user.description.toLowerCase().includes('protocolo') && 
                   !user.description.toLowerCase().includes('protocol') && 
                   !user.screen_name.toLowerCase().includes('protocolo') && 
                   !user.screen_name.toLowerCase().includes('protocol') && 
                   !user.name.toLowerCase().includes('protocolo') &&
                   !user.name.toLowerCase().includes('protocol') &&
                   !user.name.toLowerCase().includes('casadeespelho')){
                    console.log(user.screen_name)
                    unfollow_user(user.id_str)
                }
            }
            cursor = friends.next_cursor_str
            return (cursor != '0' ? unfollow_non_protocol(cursor) : 0)
        })
        .catch(error => {
            console.log('unfollow_non_protocol')
            console.log(error)
        })
}

function follow_protocol(number=0){
    let query = coin_toss ? 'protocol' : 'protocolo'

    twitter
        .get(
            'users/search', 
            {q: query,
            page: number,
            count: 20,
            include_entities: false}
        )
        .then(result => {
            let user_id = []
            for(let user of result.data){
                if (user.description.includes(query) || 
                    user.screen_name.includes(query) || 
                    user.name.includes(query)){
                    user_id.push(user.id_str)
                }
            }
            twitter
                .get(
                    'friendships/lookup', 
                    {user_id: user_id}
                )
                .then(result => {
                    for(let friend of result.data){
                        if(!friend.connections.includes('following')){
                            follow_user(friend.id_str)
                            return 0
                        }
                    }
                    return follow_protocol(number + 1)
                })
                .catch(error => {
                    console.log('follow_protocol:friendship/lookup')
                    console.log(error)
                })
        })
        .catch(error => {
            console.log('follow_protocol')
            console.log(error)
        })
}

function post(){
    let tweet_pt = 'Esse perfil segue todos os protocolos!!'
    let tweet_en = "Dude, I'm following all protocols!"
    let tweet = coin_toss ? tweet_pt: tweet_en
    if(Math.random() < 0.04){
        twitter.post(
            'statuses/update',
            {'status': tweet}
        )
    }
}

let coin_toss = Math.random() < .5

unfollow_non_protocol()
follow_protocol()
post()
