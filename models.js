const mongoose = require('mongoose');

// mongoose schema for blogpost
const blogSchema = mongoose.Schema({
    "title": {type: String, required: true},
    "content": {type: String},
    "created":{type: Date, default: Date.now},

    "author": {
        "firstName": {type: String, required: true},
        "lastName": {type: String, required: false}
    }
});

//schema for virtual content.. first + last name
blogSchema
    .virtual('authorName')
    .get(function(){
        return `${this.author.firstName} ${this.author.lastName}`;
    });

//apirepr
blogSchema.methods.apiRepr = function(){
    return {
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created,
        id: this.id
    };
}

//export
const BlogPost = mongoose.model('BlogPost', blogSchema);

module.exports = {BlogPost};