//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Conneted to MongoDB server');

    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert Todo', err);
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

//   db.collection('Users').insertOne({
//       name: 'David Adediran',
//       age: 29,
//       location: 'Ikoyi'
//   }, (err, result) => {
//       if (err) {
//           return console.log('Unable to connect to Users', err);
//       }

//       console.log(result.ops[0]._id.getTimestamp());
//   });  

    db.close();
});