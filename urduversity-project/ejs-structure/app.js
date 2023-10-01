//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const md5 = require("md5");
const multer = require("multer");
const session = require("express-session");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer upload
const upload = multer({ storage: storage });

const homeStartingContent = "";
const aboutContent = "";
const akhbarContent = "لورم ایپسم ڈالر سٹیٹ";
const contactContent = "";

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

// created mongoose connection
mongoose
  .connect("mongodb://127.0.0.1:27017/urduversityDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Mongoose Schema and model for user authentication.
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

// Mongoose New schema and model for Posts.
//   creating new schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  fileToUpload: String,
  category: String,
});

const Post = mongoose.model("Post", postSchema);

// for home route sections
let frontbanner = [];
let interviews = [];
let lectures = [];
let videos = [];
// for differnt routs/pages
let authors = [];
let letters = [];
let books = [];
let criticism = [];
let easterncriticism = [];
let westerncriticism = [];
let linguistics = [];
let psychology = [];
let cultureandcivilization = [];
let contemporaryissues = [];
let progressivemovement = [];
let psychologicacriticism = [];
let Philosophy = [];
let iqbalstudies = [];
let literatureandreligion = [];
let personalities = [];
let supplementaryliterature = [];
// for books&authors's lists
let bookslist = [];
let authorslist = [];
// 
let akhbar = [];
// 
let authenticatedUsers = [];


app.use(
  session({
    secret: "thisisasecretkey.", // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);


const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // If authenticated, proceed to the next middleware or route handler
  }
  // Store the original intended URL in the session
  req.session.intendedUrl = req.originalUrl;
  
  res.redirect("/login"); // If not authenticated, redirect to the login page
};

 

app.get("/", function(req, res) {
  Promise.all([
    Post.find({ category: "frontbanner" }),
    Post.find({ category: "interviews" }),
    Post.find({ category: "videos" }),
    Post.find({ category: "lectures" })
  ])
    .then(([frontbanner, interviews, videos, lectures]) => {
      res.render("home", {
        homeStartingContent: homeStartingContent,
        frontbanner: frontbanner,
        interviews: interviews,
        videos: videos,
        lectures: lectures
      });
    })
    .catch(err => {
      res.send(err);
    });
});




app.get("/compose", isAuthenticated, function (req, res) {
  res.render("compose");
});

// ................for posting on different routes/pages START

app.post("/compose", function (req, res) {
  const category = req.body.category;
  const post = {
    title: req.body.postTitle,
    content: req.body.postContent,
    fileToUpload: req.body.fileToUpload,
    category: category,
  };

  Post.create(post)
    .then((newPost) => {
      console.log("New blog post created:", newPost);

      switch (category) {
        case "frontbanner":
          frontbanner.push(post);
          break;
        case "videos":
          videos.push(post);
          break;
        case "interviews":
          interviews.push(post);
          break;
        case "lectures":
          lectures.push(post);
          break;
        // ----
        case "authors":
          authors.push(post);
          break;
        case "letters":
          letters.push(post);
          break;
        case "books":
          books.push(post);
          break;
        case "criticism":
          criticism.push(post);
          break;
        case "easterncriticism":
          easterncriticism.push(post);
          break;
        case "westerncriticism":
          westerncriticism.push(post);
          break;
        case "linguistics":
          linguistics.push(post);
          break;
        case "psychology":
          psychology.push(post);
          break;
        case "cultureandcivilization":
          cultureandcivilization.push(post);
          break;
        case "contemporaryissues":
          contemporaryissues.push(post);
          break;
        case "progressivemovement":
          progressivemovement.push(post);
          break;
        case "psychologicacriticism":
          psychologicacriticism.push(post);
          break;
        case "Philosophy":
          Philosophy.push(post);
          break;
        case "iqbalstudies":
          iqbalstudies.push(post);
          break;
        case "literatureandreligion":
          literatureandreligion.push(post);
          break;
        case "personalities":
          personalities.push(post);
          break;
        case "supplementaryliterature":
          supplementaryliterature.push(post);
          break;
        // ----
        case "bookslist":
          bookslist.push(post);
          break;
        case "authorslist":
          authorslist.push(post);
          break;
          case "akhbar":
            akhbar.push(post);
            break;
        default:
          // Handle unknown category
          console.log("not found unknown");
          break;
      }

      res.redirect("/");
    })
    .catch((err) => {
      console.error("Error creating blog post:", err);
      res.status(500).json({ error: "Failed to create blog post" });
    });
});

// ...

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
app.get("/delete/:postTitle", isAuthenticated, function (req, res) {
  const postTitle = req.params.postTitle;
  console.log("Deleting post with title:", postTitle); // Debugging line

  Post.findOneAndDelete({ title: postTitle })
    .then((deletedPost) => {
      console.log("Deleted post:", deletedPost); // Debugging line
      if (!deletedPost) {
        res.status(404).send("Post not found");
      } else {
        // Remove the deleted post from the appropriate category arrays
        removeFromCategoryArray(deletedPost.category, postTitle); // Call the function to remove from the array
        res.redirect("/postmanager"); // Redirect back to post manager after deletion
      }
    })
    .catch((err) => {
      console.error("Error deleting post:", err);
      res.status(500).send("Error deleting post");
    });
});

// Function to remove from the category array
function removeFromCategoryArray(category, postTitle) {
  switch (category) {
    case "frontbanner":
      removePostFromList(frontbanner, postTitle);
      break;
    case "videos":
      removePostFromList(videos, postTitle);
      break;
    case "interviews":
      removePostFromList(interviews, postTitle);
      break;
    case "lectures":
      removePostFromList(lectures, postTitle);
      break;
    case "authors":
      removePostFromList(authors, postTitle);
      break;
    case "letters":
      removePostFromList(letters, postTitle);
      break;
    case "books":
      removePostFromList(books, postTitle);
      break;
    case "criticism":
      removePostFromList(criticism, postTitle);
      break;
    case "easterncriticism":
      removePostFromList(easterncriticism, postTitle);
      break;
    case "westerncriticism":
      removePostFromList(westerncriticism, postTitle);
      break;
    case "linguistics":
      removePostFromList(linguistics, postTitle);
      break;
    case "psychology":
      removePostFromList(psychology, postTitle);
      break;
    case "cultureandcivilization":
      removePostFromList(cultureandcivilization, postTitle);
      break;
    case "contemporaryissues":
      removePostFromList(contemporaryissues, postTitle);
      break;
    case "progressivemovement":
      removePostFromList(progressivemovement, postTitle);
      break;
    case "psychologicacriticism":
      removePostFromList(psychologicacriticism, postTitle);
      break;
    case "Philosophy":
      removePostFromList(Philosophy, postTitle);
      break;
    case "iqbalstudies":
      removePostFromList(iqbalstudies, postTitle);
      break;
    case "literatureandreligion":
      removePostFromList(literatureandreligion, postTitle);
      break;
    case "personalities":
      removePostFromList(personalities, postTitle);
      break;
    case "supplementaryliterature":
      removePostFromList(supplementaryliterature, postTitle);
      break;
    case "bookslist":
      removePostFromList(bookslist, postTitle);
      break;
    case "authorslist":
      removePostFromList(authorslist, postTitle);
      break;
      case "akhbar":
        removePostFromList(akhbar, postTitle);
        break;

    default:
      // Handle unknown category
      console.log("Unknown category:", category);
      break;
  }
}

// Function to remove a post from a category array
function removePostFromList(categoryArray, postTitle) {
  const index = categoryArray.findIndex((post) => post.title === postTitle);
  if (index !== -1) {
    categoryArray.splice(index, 1);
  }
}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 

app.get("/:category/:postName", function (req, res) {
  const requestedCategory = req.params.category;
  const requestedTitle = req.params.postName;

  Post.findOne({
    category: requestedCategory,
    title: requestedTitle,
  })
    .then((selectedPost) => {
      if (selectedPost) {
        res.render("post", {
          title: selectedPost.title,
          content: selectedPost.content,
          fileToUpload: selectedPost.fileToUpload,
        });
      }
      //  else {
      //   res.render("post_not_found");
      // }
      // res.send(selectedPost)
    })
    .catch((err) => {
      console.error("Error finding blog post:", err);
      res.status(500).send("Error finding blog post");
    });

});

// ................for posting on different routes/pages END

/////////////////////



//
app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent,
  });
});


app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent,
  });
});



// 
//schema for the Contact model
const contactSchema = new mongoose.Schema({
  date: String,
  name: String,
  phone: String,
  email: String,
  message: String,
  purpose: String,
  uploadedFilePath: String
});

//Contact model
const Contact = mongoose.model("Contact", contactSchema);

// ...



app.post("/contact", upload.single("file"), async function (req, res) {
  console.log("Uploaded File:", req.file);
  const date = new Date();
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const message = req.body.message;
  const purpose = req.body.flexRadioDefault;
  // const uploadedFilePath = req.file ? req.file.path : null;
  const uploadedFilePath = req.file ? req.file.filename : null;
  console.log("Uploaded File Path:", uploadedFilePath);

  // Saving the submitted data to MongoDB
  const newContact = new Contact({
    date: date,
    name: name,
    phone: phone,
    email: email,
    message: message,
    purpose: purpose,
    uploadedFilePath: uploadedFilePath
  });

  try {
    await newContact.save();
    res.redirect("/contact");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving contact information.");
  }
});

app.get("/inbox", isAuthenticated, function(req, res) {
  // Fetching data from the MongoDB collection
  Contact.find()
    .then(inboxItems => {
      res.render("inbox", { inboxItems: inboxItems });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error fetching inbox data.");
    });
});

// post manager route

app.get("/postmanager", isAuthenticated, (req, res) => {
  Post.find()
    .then(posts => {
      const categories = [...new Set(posts.map(post => post.category))];
      res.render("postmanager", { posts, categories});
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error fetching posts for post manager.");
    });
});


//
app.get("/post_not_found.ejs", function(req, res){
  res.render("post_not_found.ejs")
});
// //////////
app.get("/login", function(req, res){
  res.render("login")
});
//user login route
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({ email: username, password: password })
    .then((foundUser) => {
      if (foundUser) {
        req.session.user = foundUser; // Set the user session
        
        // Redirect to the stored intended URL or default to "/"
        const intendedUrl = req.session.intendedUrl || "/";
        res.redirect(intendedUrl);
      } else {
        res.send("Invalid credentials");
      }
    })
    .catch((err) => {
      console.log(err);
      res.send("An error occurred");
    });
});



//user register route
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });
  newUser
    .save()
    .then(() => {
      res.render("compose");
    })
    .catch((err) => {
      res.send(err);
    });
});

/////////////
app.get("/frontbanner", function(req, res) {
  Post.find({ category: "frontbanner" })
    .then(frontbanner => {
      res.render("frontbanner", {
        frontbanner: frontbanner,
        
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/interviews", function(req, res) {
  Post.find({ category: "interviews" })
    .then(interviews => {
      res.render("interviews", {
        interviews: interviews
      });
    })
    .catch(err => {
      res.send(err);
    });
});

app.get("/lectures", function(req, res) {
  Post.find({ category: "lectures" })
    .then(lectures => {
      res.render("lectures", {
        lectures: lectures
      });
    })
    .catch(err => {
      res.send(err);
    });
});

app.get("/videos", function(req, res) {
  Post.find({ category: "videos" })
    .then(videos => {
      res.render("videos", {
        videos: videos
      });
    })
    .catch(err => {
      res.send(err);
    });
});





app.get("/authors", function(req, res) {
  Post.find({ category: "authors" })
    .then(authorsPosts => {
      res.render("authors", {
        authorsPosts: authorsPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});

// app.get("/letters", function (req, res) {
//   res.render("letters", {
//     letters: letters,
//   });
// });

app.get("/letters", function(req, res) {
  Post.find({ category: "letters" })
    .then(lettersPosts => {
      res.render("letters", {
        lettersPosts: lettersPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/books", function(req, res) {
  Post.find({ category: "books" })
    .then(booksPosts => {
      res.render("books", {
        booksPosts: booksPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/criticism", function(req, res) {
  Post.find({ category: "criticism" })
    .then(criticismPosts => {
      res.render("criticism", {
        criticismPosts: criticismPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/easterncriticism", function(req, res) {
  Post.find({ category: "easterncriticism" })
    .then(easternCriticismPosts => {
      res.render("easterncriticism", {
        easternCriticismPosts: easternCriticismPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/westerncriticism", function(req, res) {
  Post.find({ category: "westerncriticism" })
    .then(westernCriticismPosts => {
      res.render("westerncriticism", {
        westernCriticismPosts: westernCriticismPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/linguistics", function(req, res) {
  Post.find({ category: "linguistics" })
    .then(linguisticsPosts => {
      res.render("linguistics", {
        linguisticsPosts: linguisticsPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/psychology", function(req, res) {
  Post.find({ category: "psychology" })
    .then(psychologyPosts => {
      res.render("psychology", {
        psychologyPosts: psychologyPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/cultureandcivilization", function(req, res) {
  Post.find({ category: "cultureandcivilization" })
    .then(cultureCivilizationPosts => {
      res.render("cultureandcivilization", {
        cultureCivilizationPosts: cultureCivilizationPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/contemporaryissues", function(req, res) {
  Post.find({ category: "contemporaryissues" })
    .then(contemporaryIssuesPosts => {
      res.render("contemporaryissues", {
        contemporaryIssuesPosts: contemporaryIssuesPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/progressivemovement", function(req, res) {
  Post.find({ category: "progressivemovement" })
    .then(progressiveMovementPosts => {
      res.render("progressivemovement", {
        progressiveMovementPosts: progressiveMovementPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/psychologicacriticism", function(req, res) {
  Post.find({ category: "psychologicacriticism" })
    .then(psychologicaCriticismPosts => {
      res.render("psychologicacriticism", {
        psychologicaCriticismPosts: psychologicaCriticismPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/Philosophy", function(req, res) {
  Post.find({ category: "Philosophy" })
    .then(philosophyPosts => {
      res.render("Philosophy", {
        philosophyPosts: philosophyPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/iqbalstudies", function(req, res) {
  Post.find({ category: "iqbalstudies" })
    .then(iqbalStudiesPosts => {
      res.render("iqbalstudies", {
        iqbalStudiesPosts: iqbalStudiesPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/literatureandreligion", function(req, res) {
  Post.find({ category: "literatureandreligion" })
    .then(literatureReligionPosts => {
      res.render("literatureandreligion", {
        literatureReligionPosts: literatureReligionPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/personalities", function(req, res) {
  Post.find({ category: "personalities" })
    .then(personalitiesPosts => {
      res.render("personalities", {
        personalitiesPosts: personalitiesPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/supplementaryliterature", function(req, res) {
  Post.find({ category: "supplementaryliterature" })
    .then(supplementaryLiteraturePosts => {
      res.render("supplementaryliterature", {
        supplementaryLiteraturePosts: supplementaryLiteraturePosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/bookslist", function(req, res) {
  Post.find({ category: "bookslist" })
    .then(booksListPosts => {
      res.render("bookslist", {
        booksListPosts: booksListPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/authorslist", function(req, res) {
  Post.find({ category: "authorslist" })
    .then(authorsListPosts => {
      res.render("authorslist", {
        authorsListPosts: authorsListPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});


app.get("/akhbar", function(req, res) {
  Post.find({ category: "akhbar" })
    .then(akhbarPosts => {
      res.render("akhbar", {
        akhbarPosts: akhbarPosts
      });
    })
    .catch(err => {
      res.send(err);
    });
});

// ^^^^^^^^^^
app.get("/admin", function(req, res){
  res.render("admin")
});


app.get("/admin/posts", function (req, res) {
  if (req.isAuthenticated()) {
    // Find all posts
    Post.find()
      .then((posts) => {
        res.render("admin/posts", { posts: posts }); // Pass the fetched posts to the template
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        res.status(500).send("Error fetching posts");
      });
  } else {
    res.redirect("/login"); // Redirect unauthenticated users to login
  }
});


app.get("/admin/delete/:postId", function (req, res) {
  if (req.isAuthenticated()) {
    const postId = req.params.postId;

    Post.findByIdAndDelete(postId)
      .then((deletedPost) => {
        if (!deletedPost) {
          res.status(404).send("Post not found");
        } else {
          res.redirect("/admin/posts"); // Redirect to admin posts page after deletion
        }
      })
      .catch((err) => {
        console.error("Error deleting post:", err);
        res.status(500).send("Error deleting post");
      });
  } else {
    res.redirect("/login"); // Redirect unauthenticated users to login
  }
});


// .......................

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
