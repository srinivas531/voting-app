var express = require("express");
var app = express();
var assert = require('assert')
var logger = require('logger')
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.connect('mongodb://localhost:27017/voting');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: {
        type: String, unique: true
    },
    email: {
        type: String, unique: true
    },
    password: {
        type: String,
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true }
}, {
        timestamps: true
    });
var CandidateSchema = new Schema({
    name: {
        type: String
    },
    state: {
        type: String
    },
    candidateId: {
        type: String
    },
    isActive: {
        type: Boolean, default: true
    }
}, {
        timestamps: true
    });

var voteSchema = new Schema({
    candidateId: {
        type: String
    }
}, { timestamps: true })
CandidateSchema.plugin(uniqueValidator);
UserSchema.plugin(uniqueValidator);

var User = mongoose.model('users', UserSchema);
var Candidate = mongoose.model('candidates', CandidateSchema)
var Vote = mongoose.model('votes', voteSchema)

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            res.status(400).json(err)
        } else {
            res.json(users);
        }
    });
});
app.get('/candidates', function (req, res) {
    Candidate.find({}, function (err, results) {
        if (err) {
            res.status(400).json(err)
        } else {
            res.json(results);
        }
    });
});
app.get('/votes', function (req, res) {
    Vote.find({}, function (err, results) {
        if (err) {
            res.status(400).json(err)
        } else {
            res.json(results);
        }
    });
})
app.get('votes/count', function (req, res) {
    var votesArray = [];
    Candidate.find({}, function (err, results) {
        if (err) {
            res.status(400).json(err)
        } else {
            if (results.length > 0) {
                async.mapSeries(results, function (candidateObj, callback) {
                    async.waterfall([
                        function (cback) {
                            var id = candidateObj.candidateId
                            Vote.findById(id, function (err, voteResp) {
                                if (err) {
                                    cback(errI)
                                } else {
                                    cback(undefined, voteResp)
                                }
                            })
                        },
                        function (votesObj, cback) {
                            votesArray.push({ candidate: candidateObj.name, votes: votesObj.length })
                            cback(undefined)
                        }
                    ], function (error, response) {
                        if (error) {
                            callback(error)
                        } else {
                            callback(undefined, candidateObj)
                        }
                    })
                }, function (err, resp) {
                    if (err) {
                        callback(err)
                    } else {
                        callback(undefined, votesArray)
                    }
                });
            }
        }
    });
})
app.get('/users/count', function (req, res) {
    User.count({}, function (err, students) {
        if (err) {
            res.status(404).json(err)
        } else {
            res.json(students);
        }
    })
});
app.get('/candidates/count', function (req, res) {
    Candidate.count({}, function (err, records) {
        if (err) {
            res.status(404).json(err)
        } else {
            res.json(records);
        }
    })
});
app.get('/users/:id', function (req, res) {
    var conditions = { _id: req.params.id };
    User.find(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(404).json(err)
        } else {
            res.send(resp)
        }
    })
})
app.get('/candidates/:id', function (req, res) {
    var conditions = { _id: req.params.id };
    Candidate.find(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(404).json(err)
        } else {
            res.send(resp)
        }
    })
})
app.post('/user', function (req, res) {
    var users = new User(req.body);
    users.save(function (err, body) {
        if (err) {
            console.log(err.status)
            res.send(err.status);
        } else {
            res.json(users);
        }
    });
});
app.post('/candidates', function (req, res) {
    var candidates = new Candidate(req.body);
    candidates.save(function (err, body) {
        if (err) {
            console.log(err.status)
            res.send(err.status);
            res.send(err)
        } else {
            res.json(candidates);
        }
    });
})
app.post('/votes', function (req, res) {
    var votes = new Vote(req.body);
    votes.save(function (err, body) {
        if (err) {
            console.log(err.status)
            res.send(err.status);
        } else {
            res.json(votes);
        }
    });
})
app.patch('/users/:id', function (req, res) {
    var conditions = { _id: req.params.id };
    User.update(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(409).json(err)
        } else {
            res.json(resp)
        }
    })
})
app.patch('/candidates/:id', function (req, res) {
    var conditions = { _id: req.params.id };
    Candidate.update(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(409).json(err)
        } else {
            res.json(resp)
        }
    })
})
app.delete('/users/:id', function (req, res) {
    var conditions = { _id: req.params.id }
    User.findOneAndRemove(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(400).json(err)
        } else {
            res.json(resp)
        }
    })

})
app.delete('/candidates/:id', function (req, res) {
    var conditions = { _id: req.params.id }
    User.findOneAndRemove(conditions, req.body, function (err, resp) {
        if (err) {
            res.status(400).json(err)
        } else {
            res.json(resp)
        }
    })

})
var port = 5050;
app.listen(port);
console.log('voting app started at port' + port)
