const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/question");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const {
  requireAuth,
  checkUser,
  isAdmin,
} = require("./middleware/authMiddleware");
const path = require("path");
const app = express();

//middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);

//connect to Mongo DB, staci nam 1 databaza a viac collections
const dbURI =
  process.env.DB_URL;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

//register view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/questions", requireAuth, (req, res) => {
  // Question.find().sort({ createdAt: -1 })
  Question.find()
    // .sort({ "NumberOfLikes.Likes": -1, createdAt: 1 })
    .sort({createdAt: -1 })
    .then((result) => {
      res.render("index", { questions: result, title: "All questions" });
    })
    .catch((err) => {
      console.log(err);
    });
});

//Marek nadavky
app.get("/questions/slurs.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/", "slurs.txt"));
});

app.post("/questions", (req, res) => {
  // console.log(req.body);
  const question = new Question(req.body);

  question
    .save()
    .then((result) => {
      res.redirect("/questions");
    })
    .catch((err) => {
      console.log(err);
    });
});

//Svetlana rating
app.put("/questions/:id/rate/:rating", (req, res) => {
  //url already has clicked numbers in (rating) as a result of rate function (click stars)
  const id = req.params.id;
  const rating = parseInt(req.params.rating); //convert to int bec there is always string in url

  Question.findById(id) //get whole question with all parameters from DB by id and put it to that (result)
    .then((result) => {
      //just math then
      const starsAverage = result.rating.starsAverage;
      const numberOfRatings = result.rating.numberOfRatings;
      const starsSum = result.rating.starsSum;
      const newAverageRating = starsAverage
        ? (starsSum + rating) / (numberOfRatings + 1)
        : rating;
      const roundedAverage = Math.round(newAverageRating * 100) / 100;

      Question.findByIdAndUpdate(id, {
        $set: {
          rating: {
            starsAverage: roundedAverage,
            numberOfRatings: numberOfRatings + 1,
            starsSum: starsSum + rating,
          },
        },
      })
        .then(() => {
          res.json({ redirect: "/questions" });
        })
        .catch((e) => {
          console.log(e);
        });
    });
});

//Michal likes
app.put("/questions/:id/like/:NumberOfLikes", (req, res) => {
  const id = req.params.id;
  const NumberOfLikes = parseInt(req.params.NumberOfLikes);

  Question.findById(id).then((result) => {
    const Likes = result.NumberOfLikes.Likes;

    //Posiela do databazy
    Question.findByIdAndUpdate(id, {
      $set: {
        NumberOfLikes: {
          Likes: Likes + 1,
        },
      },
    })
      .then((result3) => {
        res.json({ redirect: "/questions" });
      })
      .catch((e) => {
        console.log(e);
      });
  });
});

//Michal dislikes
app.put("/questions/:id/dislike/:NumberOfDislikes", (req, res) => {
  const id = req.params.id;
  const NumberOfDislikes = parseInt(req.params.NumberOfDislikes);

  Question.findById(id).then((result) => {
    const Dislikes = result.NumberOfDislikes.Dislikes;

    //Posiela do databazy
    Question.findByIdAndUpdate(id, {
      $set: {
        NumberOfDislikes: {
          Dislikes: Dislikes + 1,
        },
      },
    })
      .then((result4) => {
        res.json({ redirect: "/questions" });
      })
      .catch((e) => {
        console.log(e);
      });
  });
});

//Michal likes
app.put("/questions/:id/like/:NumberOfLikes", (req, res) => {
  const id = req.params.id;
  const NumberOfLikes = parseInt(req.params.NumberOfLikes);

  Question.findById(id).then((result) => {
    const Likes = result.NumberOfLikes.Likes;

    //Posiela do databazy
    Question.findByIdAndUpdate(id, {
      $set: {
        NumberOfLikes: {
          Likes: Likes + 1,
        },
      },
    })
      .then((result3) => {
        res.json({ redirect: "/questions" });
      })
      .catch((e) => {
        console.log(e);
      });
  });
});

//Michal dislikes
app.put("/questions/:id/dislike/:NumberOfDislikes", (req, res) => {
  const id = req.params.id;
  const NumberOfDislikes = parseInt(req.params.NumberOfDislikes);

  Question.findById(id).then((result) => {
    const Dislikes = result.NumberOfDislikes.Dislikes;

    //Posiela do databazy
    Question.findByIdAndUpdate(id, {
      $set: {
        NumberOfDislikes: {
          Dislikes: Dislikes + 1,
        },
      },
    })
      .then((result4) => {
        res.json({ redirect: "/questions" });
      })
      .catch((e) => {
        console.log(e);
      });
  });
});

app.get("/questions/:id", (req, res) => {
  const id = req.params.id;
  Question.findById(id)
    .then((result) => {
      // ak potrebujeme pridat detaily k otazke napr. v pripade, ze tam dame delete tlacidlo tak odkomentovat r. 49
      // res.render('questions', { question: result, title: 'Question Details' });
      res.status(404).render("404");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/questions/:id", (req, res) => {
  const id = req.params.id;

  Question.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/teacher" });
    })
    .catch((err) => {
      console.log(err);
    });
});

//routing
// app.get("*", checkUser);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.get("/signup",checkUser, requireAuth, isAdmin,(req, res) => {
  res.render("signup", { title: "Signup" });
});

//teacher route
app.get("/teacher",checkUser, requireAuth, isAdmin, (req, res) => {
  Question.find()
    .sort({ "NumberOfLikes.Likes": -1, createdAt: 1 })
    .then((result) => {
      res.render("indexTeacher", { questions: result, title: "All questions" });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/statistics",checkUser, requireAuth, isAdmin, (req, res) => {
  Question.find().then((result) => {
    res.render("statistics", {
      worstQuestionsList: result,
    });
  });
});

app.get("/statistics/sort=:sort", (req, res) => {
  const sort = req.params.sort;
  Question.find()
    .sort({ [sort]: -1 })
    .then((result) => {
      res.render("statistics", {
        worstQuestionsList: result,
      });
    });
});

// app.get("/users", checkUser, requireAuth, isAdmin, (req, res) => {
//   res.redirect('/all-users');
// //   const users = [
// //     // { title: 'user number 1', snippet: 'nemam snippet 1' },
// //     // { title: 'user number 2', snippet: 'nemam snippet 2' },
// //     // { title: 'user number 2', snippet: 'nemam snippet 3' }
// // ]

// //   res.render('users',{title: 'Home', users});
// });

app.get("/users", checkUser, requireAuth, isAdmin, (req, res) => {
  User.find().sort({createdAt: -1})
    .then((result) => {
      res.render('users',{title: 'All users:', users: result});
    })
    .catch((err) => {
      console.log(err);
  })
  
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  User.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/users' })
    })
    .catch(err => {
      console.log(err);
    });
});


app.get("/questions/:id", (req, res) => {
  res.status(404).render("404");
  app.get("/test", requireAuth, (req, res) => {
    res.render("test", { title: "test" });
  });
});

app.use((req, res) => {
  res.status(404).render("404");
});
