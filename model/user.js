const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");

class USER {
  constructor(
    email,
    password,
    date,
    _id,
    name,
    imageUrl,
    from,
    googleId,
    token,
    verified
  ) {
    this.email = email;
    this.password = password;
    this.date = date;
    this._id = _id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.from = from;
    this.googleId = googleId;
    this.token = token;
    this.verified = verified;
  }
  save() {
    if (!this._id) {
      return getDb()
        .collection("users")
        .insertOne(this)
        .then((result) => {
          console.log(`user created with ${this.email} email!`);
        })
        .catch((err) => console.log(err));
    } else {
      if (this.imageUrl) {
        return getDb()
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { name: this.name, imageUrl: this.imageUrl } }
          )
          .then((result) => console.log("user Upadted"))
          .catch((err) => console.log(err));
      } else {
        return getDb()
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { name: this.name } }
          )
          .then((result) => console.log("user Upadted"))
          .catch((err) => console.log(err));
      }
    }
  }

  static totalUsers() {
    return getDb()
      .collection("users")
      .find()
      .toArray()
      .then((users) => {
        return users.length;
      })
      .catch((err) => console.log(err));
  }

  static findByEmail(email) {
    return getDb()
      .collection("users")
      .findOne({ email: email })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static findById(userId) {
    return getDb()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static getLikesOfSingleUser(email) {
    const NUMBER_PRODUCT_IN_PAGE = 9;
    return getDb()
      .collection("posts")
      .find({
        "reaction.likes": {
          $elemMatch: {
            email: email,
          },
        },
      })
      .limit(NUMBER_PRODUCT_IN_PAGE)
      .sort({ date: 1 })
      .toArray()
      .then((posts) => {
        return posts;
      })
      .catch((err) => console.log(err));
  }

  static getCommentsOfSingleUser(email) {
    return getDb()
      .collection("posts")
      .find({
        "reaction.comments": {
          $elemMatch: {
            email: email,
          },
        },
      })
      .toArray()
      .then((posts) => {
        // return posts
        let commentsWithPosts = [];
        for (let p of posts) {
          for (let c of p.reaction.comments) {
            if (c.email == email) {
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
        }
        commentsWithPosts.sort((a, b) => {
          return b.date - a.date;
        });
        return commentsWithPosts;
      });
  }
  static getUsers() {
    return getDb()
      .collection("users")
      .find()
      .toArray()
      .then((users) => {
        let updatedUsers = [];
        return getDb()
          .collection("posts")
          .find()
          .toArray()
          .then((posts) => {
            for (let user of users) {
              let likesAndComments = {
                likes: [],
                comments: [],
              };
              for (let post of posts) {
                for (let like of post.reaction.likes) {
                  if (user.email == like.email) {
                    likesAndComments.likes.push(post._id);
                  }
                }
                for (let comment of post.reaction.comments) {
                  if (user.email === comment.email) {
                    likesAndComments.comments.push(post._id);
                  }
                }
              }
              updatedUsers.push({ ...user, reactionLength: likesAndComments });
            }
            return updatedUsers;
          });
      });
  }
  static getUsersLength() {
    return getDb()
      .collection("users")
      .find()
      .toArray()
      .then((users) => {
        return users.length;
      })
      .catch((err) => console.log(err));
  }

  static postSearchUsers(email) {
    return getDb()
      .collection("users")
      .find({ email: { $regex: email } })
      .toArray()
      .then((users) => {
        let updatedUsers = [];
        return getDb()
          .collection("posts")
          .find()
          .toArray()
          .then((posts) => {
            for (let user of users) {
              let likesAndComments = {
                likes: [],
                comments: [],
              };
              for (let post of posts) {
                for (let like of post.reaction.likes) {
                  if (user.email == like.email) {
                    likesAndComments.likes.push(post._id);
                  }
                }
                for (let comment of post.reaction.comments) {
                  if (user.email === comment.email) {
                    likesAndComments.comments.push(post._id);
                  }
                }
              }
              updatedUsers.push({ ...user, reactionLength: likesAndComments });
            }
            return updatedUsers;
          });
      });
  }

  static postPasswordRecovery(email, token) {
    return getDb()
      .collection("users")
      .findOne({ email: email })
      .then((user) => {
        console.log(user);
        if (user) {
          return getDb()
            .collection("users")
            .updateOne(
              { email: email },
              {
                $set: {
                  token: token,
                  tokenDateExpiration: Date.now() + 180000,
                },
              }
            )
            .then((result) => {
              return user;
            });
        } else {
          return false;
        }
      });
  }

  static getNewPassword(token) {
    return getDb()
      .collection("users")
      .findOne({
        token: token,
        tokenDateExpiration: { $gt: Date.now() },
      })
      .then((user) => {
        return user;
      })
      .catch((err) => console.log(err));
  }

  static postNewPassword(userId, token, password) {
    return getDb()
      .collection("users")
      .updateOne(
        {
          _id: new ObjectId(userId),
          token: token,
          tokenDateExpiration: { $gt: Date.now() },
        },
        {
          $set: {
            password: password,
            verified: true,
            token: null,
            tokenDateExpiration: null,
          },
        }
      )
      .then((result) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  static verifyAccount(email, token) {
    return getDb()
      .collection("users")
      .findOne({ email: email, token: token })
      .then((user) => {
        return getDb()
          .collection("users")
          .updateOne(
            { _id: new ObjectId(user._id) },
            {
              $set: {
                verified: true,
                token: null,
              },
            }
          )
          .then((result) => {
            console.log(`verify email ${email}`);
            return user;
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  static addOAuth(userId, googleId, imageUrl, name) {
    return getDb()
      .collection("users")
      .updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $set: {
            googleId: googleId,
            imageUrl: imageUrl,
            name: name,
          },
        }
      );
  }
}

module.exports = USER;
