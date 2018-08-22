//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Conneted to MongoDB server');

    db.collection('Todos').insertOne({
        text: 'Write blog',
        completed: false
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert Todo', err);
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.collection('Users').insertOne({
        name: 'Olaseni Shoyoola',
        age: 28,
        location: 'Anthony'
    }, (err, result) => {
        if (err) {
            return console.log('Unable to connect to Users', err);
        }

        console.log(result.ops[0]._id.getTimestamp());
    });  

    db.close();
});