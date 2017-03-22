// authors: Colin & Ally
// assignment: Node Blog App 
// date: 3.21.17


//Require our dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

//setup database url
const {DATABASE_URL, PORT} = require('./config');
//setup require the blogpost
const {BlogPost} = require('./models');

const app = express();

//morgan and setupt json parser
app.use(morgan('common'));
app.use(bodyParser.json());

//mongoose promise
mongoose.Promise = global.Promise;

app.get('/blog-posts', (req, res) => {
    BlogPost
    .find()
    .exec()
    .then(Blogposts => {
        console.log(Blogposts);
        res.json(
            Blogposts.map(post => post.apiRepr())
        );
    })
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error 😵 '});
        });
});

app.post('/blog-posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author})
  .then(
    restaurant => res.status(201).json(restaurant.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: `Internal server error 😞 `});
  });
});

app.put('/blog-posts/:id', (req, res) => {
  
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author']; 

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .exec()
  .then(restaurant => res.status(201).end())
  .catch(err => res.status(400).json({message: `Internal server error 😱 `}));
});

app.delete('/blog-posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: `Internal server error 🤔 `}));
});

//any other route goes to 404
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// `closeServer` function is here in original code
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};