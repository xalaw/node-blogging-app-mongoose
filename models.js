const mongoose = require('mongoose');

// mongoose schema for blogpost
const blogSchema = mongoose.Schema({
    "title": {type: String, required: true},
    "content": {type: String},
    "created":{type: Date, default: Date.now},

    "author": {
        "firstname": {type: String, required: true},
        "lastname": {type: String, required: false}
    }
});


//schema for virtual content.. first + last name
blogSchema
    .virtual('authorName')
    .get(function(){
        return `${this.author.firstname} ${this.author.lastname}`;
    });


//apirepr
blogSchema.methods.apiRepr = function(){
    return {
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created
    };
}


//export
const BlogPost = mongoose.model('BlogPost', blogSchema);

module.exports = {BlogPost};