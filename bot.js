// TODO: Handle errors
// TODO: Tweet protocol messages

// HOWTO: Check size with Object.keys(_).length

require('dotenv').config()
const config = require('./config')
const twit = require('twit')
const fs = require('fs')

const twitter = new twit(config)

function show_user(user_id){
    twitter.get(
        'users/show',
        {user_id: user_id},
        function (err, user, response){
            if(err == undefined){
                console.log(user)
            }
        }
    )
}

function unfollow_user(user_id){
    twitter.post(
        'friendship/destroy',
        {user_id: user_id},
        function (err, user, response){
            if(err == undefined){
                console.log(`Unfollowing @${user.screen_name}!!`)
            }
        }
    )
}

function follow_user(user_id){
    twitter.post(
        'friendships/create',
        {user_id: user_id,
        follow: false},
        function (err, user, response){
            if (err == undefined){
                twitter.post(
                    'statuses/update',
                    {'status': `Following @${user.screen_name}!!`}
                )
            }
        }
    )
}

let cursor = '-1'
while(cursor != '0'){
    console.log('ENTROU AQUI 1')
    twitter
        .get('friends/list', 
            {screen_name: 'SirProtocolBot',
            cursor: cursor, 
            skip_status: true,
            include_user_entities: false})
        .then(function (result){
            console.log('ENTROU AQUI 2')
            users = result.data.users
            for(let user of users){
                console.log(user.screen_name)
                if(!user.description.includes('protocol') && 
                   !user.screen_name.includes('protocol') && 
                   !user.name.includes('protocol')){
                    console.log(user.screen_name)
                    //unfollow_user(user.user_id)
                }
            }
            cursor = result.data.next_cursor_str
        })
    break
}

if(false){
let number = 0
let friend_found = false
while(number < 50 && !friend_found){
    friend_found = true
    twitter.get(
        'users/search', 
        {q: 'protocol',
         page: number,
         count: 20,
         include_entities: false}, 
        function (err, users, response){
            let user_id = []
            for(let user of users){
                if(user.description.includes('protocol') || 
                   user.screen_name.includes('protocol') || 
                   user.name.includes('protocol')){
                       user_id.push(user.id_str)
                   }
            }
            twitter.get(
                'friendships/lookup', 
                {user_id: user_id},
                function (err, friends, response){
                    console.log(friends)
                    for(let friend of friends){
                        if(!friend.connections.includes('following')){
                            console.log(friend.id_str)
                            follow_user(friend.id_str)
                            found_friend = true
                            break
                        }
                    }
                }
            )
        }
    )
    number += 1
}
}