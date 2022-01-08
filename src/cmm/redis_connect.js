const redis = require('redis');
var redisClient = redis.createClient({
    host: 'localhost',
    port: 6379,
});
redisClient.on('connect', () => {
    console.log('Redis client connected');
});
redisClient.on('error', (error) => {
    console.log('Redis not connected', error);
});

module.exports = redisClient;