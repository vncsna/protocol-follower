// TODO: Tweet cool protocol messages
// HOWTO: Check size with Object.keys(_).length

require('dotenv').config()
const config = require('./config')
const twit = require('twit')
const fs = require('fs')

const twitter = new twit(config)

function show_user(user_id){
    twitter
        .get(
            'users/show',
            {user_id: user_id}
        )
        .then(result => {
            console.log(result)
        })
        .catch(error => {
            console.log('show_user')
            console.log(error)
        })
}

function follow_user(user_id){
    twitter
        .post(
            'friendships/create',
            {user_id: user_id,
            follow: false}
        )
        .then(result => {
            tweet = `Following @${result.data.screen_name}!!`
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
            console.log(`Unfollowing @${result.data.screen_name}`)
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
                if(!user.description.toLowerCase().includes('protocol') && 
                   !user.screen_name.toLowerCase().includes('protocol') && 
                   !user.name.toLowerCase().includes('protocol')){
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
    twitter
        .get(
            'users/search', 
            {q: 'protocol',
            page: number,
            count: 20,
            include_entities: false}
        )
        .then(result => {
            let user_id = []
            for(let user of result.data){
                if (user.description.includes('protocol') || 
                    user.screen_name.includes('protocol') || 
                    user.name.includes('protocol')){
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

unfollow_non_protocol()
follow_protocol()
