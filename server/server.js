require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    })

    todo.save().then(
        doc => res.send(doc),
        e => res.status(400).send(e)
    );
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid ID');
    }

    Todo.findById(id).then(
        todo => {
            if(!todo)
                return res.status(404).send('Resource not found');
            res.send({todo});
        }
    ).catch(e => res.status(400).send('Hmm... something went wrong'));
});

app.get('/todos', (req, res) => {
    Todo.find().then(todos => {
        res.send({todos});
    }, e => res.status(400).send(e));
})

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }

    Todo.findByIdAndRemove(id).then(todo => {
        if(!todo) {
            return res.status(404).send('Resource not found');
        }
        res.send({todo});
    }).catch(e => res.status(400).send('Hmm... something went wrong'));
})

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
        if(!todo) {
            return res.status(404).send('Resource not found');
        }
        res.send({todo});
    }).catch(e => {
        res.status(400).send('Hmm... something went wrong');
    });
});

app.post('/users', (req, res) => {
    var payload = _.pick(req.body, ['email', 'password']);

    var user = new User(payload);

    user.save().then(user => {
        return user.generateAuthToken();
    }).then(token => {
        res.header('x-auth', token).send(user)
    }).catch(e => {
        res.status(400).send(e);
    });
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var payload = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(payload.email, payload.password).then(user => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        })
    }).catch(e => {
        res.status(400).send();
    });
})

app.post('/users/token');

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};