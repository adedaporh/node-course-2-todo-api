const {ObjectID} = require('mongodb');

const {mongoose} = require("../server/db/mongoose");
const {Todo} = require("../server/models/todo");

// Todo.remove({}).then((result) => {
//     console.log(result);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findByIdAndRemove('5b7f09b219cfc3067c8b9d98').then(todo => {
    console.log(todo);
});