// authors: Colin & Ally
// assignment: Node Blog App 
// date: 3.21.17
//
//

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
            res.status(500).json({message: 'Internal server error'});
        });

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