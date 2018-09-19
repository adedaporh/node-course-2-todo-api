const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Text todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it('should not create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
})

describe('GET /todos/:id', () => {
    it('should return doc todo', done => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404 if todo not found', done => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .expect(res => {
                expect(res.error.text).toBe('Resource not found');
            })
            .end(done);
    });

    it('should return 404 for non-object ids', done => {
        var id = '123';
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect(res => {
                expect(res.error.text).toBe('Invalid ID');
            })
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then(todo => {
                    expect(todo).toNotExist();
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return 404 if todo not found', done => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .expect(404)
            .expect(res => {
                expect(res.error.text).toBe('Resource not found');
            })
            .end(done);
    });

    it('should return 400 if object id is invalid', done => {
        var id = '123';
        request(app)
            .delete(`/todos/${id}`)
            .expect(400)
            .expect(res => {
                expect(res.error.text).toBe('Invalid ID');
            })
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString();
        var payload = {text: "Updated text", completed: true};

        request(app)
            .patch(`/todos/${id}`)
            .send(payload)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(payload.text);
                expect(res.body.todo.completed).toBe(payload.completed);
                expect(res.body.todo.completedAt).toBeA("number");
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(payload.text);
                    expect(todo.completed).toBe(payload.completed);
                    expect(todo.completedAt).toBeA("number");
                    done();
                }).catch(e => done(e));
            });
    });

    it('should clear completedAt when todo is not completed', done => {
        var id = todos[1]._id.toHexString();
        var payload = {text: "Updated text", completed: false};
        request(app)
            .patch(`/todos/${id}`)
            .send(payload)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(payload.text);
                expect(res.body.todo.completed).toBe(payload.completed);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(todo => {
                    expect(todo.text).toBe(payload.text);
                    expect(todo.completed).toBe(payload.completed);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /users/me', () => {
    it('should return user data if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            }).end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            }).end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', done => {
        var email = 'example@example.com';
        var password = '123abcd';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.email).toBe(email);
            }).end(err => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then(user => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                });
            });
    });

    it('should return validation errors if request invalid', done => {
        var email = 'example@example.';
        var password = '123abcd';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
    
    it('should not create user if email in use', done => {
        var email = users[0].email;
        var password = '123abcd';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});