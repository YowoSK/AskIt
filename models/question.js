const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    rating: {
      starsAverage: {
        type: Number,
      },
      numberOfRatings: {
        type: Number,
        default: () => 0,
      },
      starsSum: {
        type: Number,
        default: () => 0,
      },
    },

    NumberOfLikes: {
      Likes: {
        type: Number,
        default: () => 0,
      },
    },

    NumberOfDislikes: {
      Dislikes: {
        type: Number,
        default: () => 0,
      },
    },

    input: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
