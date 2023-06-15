const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
const fs = require("fs");

class POST {
  constructor(
    title,
    imageUrl,
    description,
    status,
    author,
    category,
    tags,
    post,
    updateDate,
    date,
    _id,
    reaction
  ) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.status = status;
    this.author = author;
    this.category = category;
    this.tags = tags;
    this.post = post;
    this.date = date;
    this.updateDate = updateDate;
    this._id = _id;
    this.reaction = reaction;
  }
  save() {
    if (!this._id) {
      return getDb()
        .collection("posts")
        .insertOne({
          title: this.title,
          imageUrl: this.imageUrl,
          description: this.description,
          status: this.status,
          author: this.author,
          category: this.category,
          tags: this.tags,
          post: this.post,
          date: this.date,
          updateDate: this.updateDate,
          _id: this._id,
          reaction: {
            totalView: 0,
            comments: [],
            likes: [],
          },
        })
        .then((result) => {
          console.log("post created!GOOD LUCK");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (this.imageUrl) {
        return getDb()
          .collection("posts")
          .findOne({ _id: new ObjectId(this._id) })
          .then((post) => {
            return getDb()
              .collection("posts")
              .updateOne(
                { _id: new ObjectId(this._id) },
                {
                  $set: {
                    title: this.title,
                    description: this.description,
                    status: this.status,
                    author: this.author,
                    category: this.category,
                    tags: this.tags,
                    post: this.post,
                    updateDate: this.updateDate,
                    imageUrl: this.imageUrl,
                  },
                }
              )
              .then((result) => {
                fs.unlinkSync(post.imageUrl);
              });
          })
          .then((result) => {
            console.log(`post${this.title} updated!`);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return getDb()
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(this._id) },
            {
              $set: {
                title: this.title,
                description: this.description,
                status: this.status,
                author: this.author,
                category: this.category,
                tags: this.tags,
                post: this.post,
                updateDate: this.updateDate,
              },
            }
          )
          .then((result) => {
            console.log(`post${this.title} updated!`);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
  static adminGetPosts() {
    return getDb()
      .collection("posts")
      .find()
      .toArray()
      .then((posts) => {
        return posts;
      })
      .catch((err) => console.log(err));
  }

  static getRelatdPosts(category, postId) {
    return getDb()
      .collection("posts")
      .find({ category: category, _id: { $ne: new ObjectId(postId) } })
      .sort({ date: -1 })
      .limit(3)
      .toArray()
      .then((relatedPosts) => {
        return relatedPosts;
      })
      .catch((err) => console.log(err));
  }

  static userGetPostsByCategory(category, sort, pageNumber) {
    const NUMBER_PRODUCT_IN_PAGE = 9;
    const sortType = sort ? { "reaction.totalView": -1 } : { date: -1 };
    return getDb()
      .collection("posts")
      .find({ status: "show", category: category })
      .skip((pageNumber - 1) * NUMBER_PRODUCT_IN_PAGE)
      .limit(NUMBER_PRODUCT_IN_PAGE)
      .sort(sortType)
      .toArray()
      .then((posts) => {
        return getDb()
          .collection("posts")
          .countDocuments()
          .then((totalPosts) => {
            return { posts, totalPosts };
          });
      })
      .catch((err) => console.log(err));
  }

  static adminDeletePost(postId) {
    return getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) })
      .then((post) => {
        return getDb()
          .collection("posts")
          .deleteOne({ _id: new ObjectId(postId) })
          .then((result) => {
            console.log("Delete Post");
            console.log(post.imageUrl);
            fs.unlinkSync(post.imageUrl);
          });
      })
      .catch((err) => console.log(err));
  }
  static adminGetPost(postId) {
    return getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) })
      .then((post) => {
        return post;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static getPost(postId) {
    return getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postId), status: "show" })
      .then((post) => {
        return getDb()
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(postId) },
            { $inc: { "reaction.totalView": 1 } }
          )
          .then((result) => {
            return post;
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static userGetPosts(sort, pageNumber) {
    const NUMBER_PRODUCT_IN_PAGE = 9;
    const sortType = sort ? { "reaction.totalView": -1 } : { date: -1 };
    return getDb()
      .collection("posts")
      .find({ status: "show" })
      .skip((pageNumber - 1) * NUMBER_PRODUCT_IN_PAGE)
      .limit(NUMBER_PRODUCT_IN_PAGE)
      .sort(sortType)
      .toArray()
      .then((posts) => {
        return getDb()
          .collection("posts")
          .countDocuments()
          .then((totalPosts) => {
            return {
              posts,
              totalPosts,
            };
          });
      })
      .catch((err) => console.log(err));
  }
  static setComment(postId, email, date, comment, name, imageUrl) {
    return getDb()
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: {
            "reaction.comments": {
              _id: new ObjectId(),
              email: email,
              date: date,
              comment: comment,
              name: name,
              reply: "",
              imageUrl: imageUrl,
            },
          },
        }
      );
  }
  static getComments() {
    return getDb()
      .collection("posts")
      .find()
      .toArray()
      .then((posts) => {
        let commentsWithPosts = [];
        for (let p of posts) {
          for (let c of p.reaction.comments) {
            commentsWithPosts.push({
              postId: new ObjectId(p._id),
              commentId: new ObjectId(c._id),
              title: p.title,
              imageUrl: p.imageUrl,
              comment: c.comment,
              reply: c.reply,
              email: c.email,
              date: c.date,
              show: c.show,
            });
          }
        }
        // console.log(commentsWithPosts);
        commentsWithPosts.sort((a, b) => {
          return b.date - a.date;
        });
        return commentsWithPosts;
      });
  }

  static postEditSlider(sliderId, title, description, postUrl, turnNumber) {
    return getDb()
      .collection("slides")
      .updateOne(
        { _id: new ObjectId(sliderId) },
        {
          $set: {
            title: title,
            description: description,
            postUrl: postUrl,
            turnNumber: turnNumber,
          },
        }
      )
      .then((result) => {
        console.log("slider Update!");
      })
      .catch((err) => console.log(er));
  }

  static totalComments() {
    return this.adminGetPosts()
      .then((posts) => {
        let totalComments = 0;
        for (let p of posts) {
          totalComments =
            p.reaction && p.reaction.comments
              ? totalComments + +p.reaction.comments.length
              : totalComments + 0;
        }
        return totalComments;
      })
      .catch((err) => console.log(err));
  }

  static totalView() {
    return this.adminGetPosts()
      .then((posts) => {
        let totalView = 0;
        for (let p of posts) {
          totalView =
            p.reaction && p.reaction.totalView
              ? totalView + +p.reaction.totalView
              : totalView + 0;
        }
        return totalView;
      })
      .catch((err) => console.log(err));
  }

  static totalUserComments() {
    return getDb()
      .collection("posts")
      .find()
      .toArray()
      .then((posts) => {
        let userComments = 0;
        return getDb()
          .collection("users")
          .find()
          .toArray()
          .then((users) => {
            for (let p of posts) {
              for (let u of users) {
                for (let c of p.reaction.comments) {
                  if (u.email == c.email) {
                    userComments += 1;
                  }
                }
              }
            }
            return userComments;
          });
        // console.log(commentsWithPosts);
      });
  }

  static totalLikes() {
    return this.adminGetPosts()
      .then((posts) => {
        let totalLikes = 0;
        for (let p of posts) {
          totalLikes =
            p.reaction && p.reaction.likes
              ? totalLikes + +p.reaction.likes.length
              : totalLikes + 0;
        }
        return totalLikes;
      })
      .catch((err) => console.log(err));
  }

  static totalPosts() {
    return this.adminGetPosts()
      .then((posts) => {
        return posts.length;
      })
      .catch((err) => console.log(err));
  }

  static getEditSlider(sliderId) {
    return getDb()
      .collection("slides")
      .findOne({ _id: new ObjectId(sliderId) })
      .then((slide) => {
        return slide;
      })
      .catch((err) => console.log(err));
  }

  static deleteSLider(sliderId) {
    return getDb()
      .collection("slides")
      .findOne({ _id: new ObjectId(sliderId) })
      .then((slide) => {
        return getDb()
          .collection("slides")
          .deleteOne({ _id: new ObjectId(sliderId) })
          .then((result) => {
            fs.unlinkSync(slide.imageUrl);
            console.log("slide delete");
          })
          .catch((err) => console.log(err));
      });
  }

  static addNewSlider(title, description, postUrl, turnNumber, imageUrl) {
    return getDb()
      .collection("slides")
      .insertOne({ title, description, postUrl, turnNumber, imageUrl })
      .then((res) => console.log("new Slider added"))
      .catch((err) => console.log(err));
  }

  static getSliders() {
    return getDb()
      .collection("slides")
      .find()
      .toArray()
      .then((slides) => {
        let sortSlies = slides.sort((a, b) => a.turnNumber - b.turnNumber);
        return sortSlies;
      })
      .catch((err) => console.log(err));
  }

  static getDeleteComment(postId, commentId) {
    return getDb()
      .collection("posts")
      .updateOne(
        {
          _id: new ObjectId(postId),
        },
        { $pull: { "reaction.comments": { _id: new ObjectId(commentId) } } }
      )
      .then((result) => {
        console.log("delete comment");
      })
      .catch((err) => console.log(err));
  }

  // static postSlides(slides) {
  //   return getDb()
  //     .collection("slides")
  //     .insertMany({ slide1: slides[0], slide2: slides[1], slide3: slides[2] })
  //     .then((res) => {
  //       console.log("slides Update...");
  //     })
  //     .catch((err) => console.log(err));
  // }

  static postCommentUpdate(postId, commentId, comment, reply) {
    return getDb()
      .collection("posts")
      .updateOne(
        {
          _id: new ObjectId(postId),
          "reaction.comments._id": new ObjectId(commentId),
        },
        {
          $set: {
            "reaction.comments.$.comment": comment,
            "reaction.comments.$.reply": reply,
          },
        }
      )
      .then((result) => {
        return result;
      });
  }

  static getLikesOfSinglePost(postId) {
    return getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) })
      .then((post) => {
        return post.reaction.likes;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getCommentsOfSinglePost(postId) {
    return getDb()
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) })
      .then((post) => {
        let comments = [];
        for (let c of post.reaction.comments) {
          comments.push(c);
        }
        return {
          comments: comments,
          post: { title: post.title, postId: post._id },
        };
      });
  }

  static setLike(postId, email, date, cookielikeId) {
    if (email == "guest") {
      if (!cookielikeId) {
        const likeId = new ObjectId();
        return getDb()
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(postId) },
            {
              $push: {
                "reaction.likes": {
                  _id: new ObjectId(likeId),
                  email: email,
                  date: date,
                },
              },
            }
          )
          .then((result) => {
            return likeId;
          })
          .catch((err) => console.log(err));
      } else {
        return getDb()
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(postId) },
            {
              $pull: {
                "reaction.likes": {
                  _id: new ObjectId(cookielikeId),
                },
              },
            }
          )
          .then((result) => {
            return false;
          })
          .catch((err) => console.log(err));
      }
    } else {
      return getDb()
        .collection("posts")
        .findOne({ _id: new ObjectId(postId), "reaction.likes.email": email })
        .then((result) => {
          if (!result) {
            return getDb()
              .collection("posts")
              .updateOne(
                { _id: new ObjectId(postId) },
                {
                  $push: {
                    "reaction.likes": {
                      _id: new ObjectId(),
                      email: email,
                      date: date,
                    },
                  },
                }
              )
              .then((result) => {})
              .catch((err) => console.log(err));
          } else {
            return getDb()
              .collection("posts")
              .updateOne(
                { _id: new ObjectId(postId) },
                {
                  $pull: {
                    "reaction.likes": {
                      email: email,
                    },
                  },
                }
              )
              .then((result) => {})
              .catch((err) => console.log(err));
          }
        });
    }
  }
  static postSearch(searchedText) {
    return getDb()
      .collection("posts")
      .find({ $text: { $search: searchedText } })
      .toArray()
      .then((posts) => {
        return posts;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = POST;
