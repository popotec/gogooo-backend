/*const redis = require("redis");

require('dotenv').config();

const puts = (error, stdout) => {
    console.log(error)
    console.log(stdout)
}
exec('redis/src/redis-server redis/redis.conf', puts);

export const redisClient = redis.createClient(process.env.REDIS_URL);
// process.env.REDIS_URL is the redis url config variable name on heroku. 
// if local use redis.createClient()
redisClient.on('connect', () => {
    console.log('Redis client connected')
});
redisClient.on('error', (error) => {
    console.log('Redis not connected', error)
});
*/