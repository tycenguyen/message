var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient();



var i = 0

var amqp = require('amqplib/callback_api');

const { Kafka } = require('kafkajs')
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['127.0.0.1:9092']
})
const producer = kafka.producer()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/come', function(req, res, next) {
    // console.log(req);
    var title = req.body['title'];
    var redis = req.body['redis'];
    var kafka = req.body['kafka'];

    i += 1;
    if (title) {
        amqp.connect('amqp://localhost', function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                var queue = 'dashboard.posts';
                var msg = {
                    title: 'rabbit',
                    data: title,
                    index: i
                };

                // var msg = 'Hello World! 123';

                channel.assertQueue(queue, {
                    durable: true
                });
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

                // console.log(" [x] Sent %s", msg);
            });
        });
    }

    if (redis) {
        var msgRe = {
            title: 'redis',
            data: redis,
            index: i
        };
        // var list = client.get('dashboard:development:redis_data');
        var multi = client.multi();
        multi.rpush('dashboard:development:redis_data', JSON.stringify(msgRe));
        multi.exec(function(errors, results) {
            console.log(errors);
            console.log(results);
        });
    }

    if(kafka) {
        var msgKa = {
            title: 'kafka',
            data: kafka,
            index: i
        };

        producer.connect()
        producer.send({
            topic: 'test',
            messages: [
                { value: JSON.stringify(msgKa) },
            ],
        })
    }

    res.redirect('/');
});

module.exports = {
    kafka_topic: 'example',
    kafka_server: 'localhost:2181',
  };
module.exports = router;
