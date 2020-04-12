//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

const homeStartingContent = "Welcome to my public journal. Here you can share your own thoughts, ideas or anything you want. I hope you will enjoy using my little creation. Happy writing :)";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Set up default mongoose connection
var mongoDB = 'mongodb+srv://admim-shadiul:<PASSWORD>@cluster0-dxqs0.mongodb.net/blogsDB';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model('Post', postSchema);

const post1 = new Post({
  title: 'Tutorial',
  content: 'Click on "COMPOSE" button to write a post and then hit "Publish" button. Enjoy!'
});

const defaultPosts = [post1];

app.get('/', function (req, res) {

  Post.find({}).sort({
    _id: -1
  }).exec(function (err, foundPosts) {
    if (foundPosts.length === 0) {
      Post.insertMany(defaultPosts, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved default items to database');
        }
      });
      res.redirect('/');
    } else {

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);

      if (isNaN(page) || isNaN(limit)) {
        page = 1;
        limit = 10;
      }

      const totalPages = parseInt((foundPosts.length + 1) / limit);
      console.log('total page: ' + totalPages + ' limit: ' + limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};

      if (endIndex < foundPosts.length) {
        results.next = {
          page: page + 1,
          limit: limit
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        };
      }
      results.results = foundPosts.slice(startIndex, endIndex);

      res.render('home', {
        homeStartingContent: homeStartingContent,
        posts: results.results,
        totalPages: totalPages,
        limit: limit
      });
    }
  });

});

app.get('/about', function (req, res) {
  res.render('about', {
    aboutContent: aboutContent
  });
});

app.get('/contact', function (req, res) {
  res.render('contact', {
    contactContent: contactContent
  });
});

app.get('/compose', function (req, res) {
  res.render('compose');
});

app.get('/posts/:postId', function (req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({
    _id: requestedPostId
  }, function (err, foundPost) {
    res.render('post', {
      title: foundPost.title,
      content: foundPost.content
    });
  });
});


app.post('/compose', function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function (err) {
    if (!err) {
      res.redirect('/');
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
