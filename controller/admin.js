const POST = require("../model/post");
const USER = require("../model/user");
const nodemailer = require("nodemailer");
const { getDb } = require("../util/database");
// posts section
let transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jsmag.ir@gmail.com",
    pass: "ggpuibgbciiyvrti",
  },
});

exports.getUploadFiles = (req, res, next) => {
  return getDb()
    .collection("uploads")
    .find({ type: req.params.type })
    .toArray()
    .then((files) => {
      res.render(`admin/get-file`, {
        pageTitle: "get Upload file",
        path: "admin/setting",
        subPath: "uploads",
        files: files,
      });
    });
};

exports.getUpload = (req, res, next) => {
  res.render("admin/upload-file", {
    path: "admin/setting",
    subPath: "upload",
    pageTitle: "upload file",
  });
};

exports.postUpload = (req, res, next) => {
  return getDb()
    .collection("uploads")
    .insertOne({
      title: req.body.title,
      type: req.body.type,
      addressUrl: req.file.path,
    })
    .then((result) => {
      res.redirect("/admin/setting");
    });
};

exports.postEditSlide = (req, res, next) => {
  const slideId = req.body.slideId;
  const title = req.body.title;
  const description = req.body.description;
  const postUrl = req.body.postUrl;
  const turnNumber = Number(req.body.turnNumber);
  POST.postEditSlider(slideId, title, description, postUrl, turnNumber)
    .then((result) => {
      res.redirect("/admin/setting/slider/management");
    })
    .catch((err) => console.log(err));
};

exports.getEditSlide = (req, res, next) => {
  const sliderId = req.params.sliderId;
  POST.getEditSlider(sliderId)
    .then((slide) => {
      res.render("admin/edit-slider", {
        path: "admin/setting",
        subPath: "slider",
        pageTitle: "Edit Slide",
        slide: slide,
      });
    })
    .catch((err) => console.log(err));
};

exports.postSliders = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const turn = Number(req.body.turn);
  const imageUrl = req.file.path;
  const postUrl = req.body.postUrl;
  POST.addNewSlider(title, description, postUrl, turn, imageUrl).then(
    (result) => {
      res.redirect("/admin/setting/slider/management");
    }
  );
};

exports.getSendEmail = (req, res, next) => {
  const userEmail = req.params.userEmail ? req.params.userEmail : "";

  res.render("admin/sendEmail", {
    pageTitle: "send email",
    userEmail: userEmail,
    path: "admin/user/sendEmail",
  });
};

exports.getDeleteComment = (req, res, next) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  POST.getDeleteComment(postId, commentId)
    .then((result) => {
      res.redirect("/admin/comments");
    })
    .catch((err) => console.log(err));
};

exports.getSlider = (req, res, next) => {
  POST.getSliders().then((slides) => {
    res.render("admin/slider-management", {
      pageTitle: "Slider Management",
      slides: slides,
      path: "admin/setting",
      subPath: "slider",
    });
  });
};

exports.getDeleteSlider = (req, res, next) => {
  const sliderId = req.params.sliderId;
  POST.deleteSLider(sliderId)
    .then((result) => {
      res.redirect("/admin/setting/slider/management");
    })
    .catch((err) => console.log(err));
};

exports.getSetting = (req, res, next) => {
  res.render("admin/setting", {
    pageTitle: "setting",
    path: "admin/setting",
    subPath: "",
  });
};
exports.getAddSlider = (req, res, next) => {
  res.render("admin/add-slider", {
    pageTitle: "add new Slider",
    path: "admin/setting",
    subPath: "slider",
  });
};

exports.postSearchUser = (req, res, next) => {
  const email = req.body.email;
  USER.postSearchUsers(email)
    .then((user) => {
      POST.totalComments().then((totalCommentsLength) => {
        POST.totalUserComments().then((totalUserCommentsLength) => {
          POST.totalLikes().then((totalLikesLength) => {
            res.render("admin/users", {
              pageTitle: "Recent Users",
              path: "admin/users",
              users: user,
              totalLikesLength: totalLikesLength,
              totalUserCommentsLength: totalUserCommentsLength,
              totalCommentsLength: totalCommentsLength,
            });
          });
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.getUsers = (req, res, next) => {
  POST.totalComments().then((totalCommentsLength) => {
    POST.totalUserComments().then((totalUserCommentsLength) => {
      POST.totalLikes().then((totalLikesLength) => {
        USER.getUsers().then((users) => {
          res.render("admin/users", {
            pageTitle: "Recent Users",
            path: "admin/users",
            users: users,
            totalLikesLength: totalLikesLength,
            totalUserCommentsLength: totalUserCommentsLength,
            totalCommentsLength: totalCommentsLength,
          });
        });
      });
    });
  });
};
exports.getCommentsOfSingleUser = (req, res, next) => {
  const userEmail = req.params.userEmail;
  USER.getCommentsOfSingleUser(userEmail).then((commentsWithPosts) => {
    res.render("admin/commentsOfSingleUser", {
      pageTitle: userEmail,
      commentsWithPosts: commentsWithPosts,
      path: "admin/users",
    });
  });
};
exports.getLikesOfSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  POST.getLikesOfSinglePost(postId)
    .then((likes) => {
      res.render("admin/likes", {
        pageTitle: "likes",
        likes: likes,
        path: "admin/posts",
      });
    })
    .catch((err) => console.log(err));
};

exports.getComments = (req, res, next) => {
  POST.totalUserComments().then((totalCommentsLength) => {
    POST.totalLikes().then((totalLikesLength) => {
      USER.totalUsers().then((totalUsersLength) => {
        POST.getComments().then((commentsWithPosts) => {
          res.render("admin/comments", {
            pageTitle: "Comments",
            path: "admin/comments",
            commentsWithPosts: commentsWithPosts,
            totalUsersLength: totalUsersLength,
            totalLikesLength: totalLikesLength,
            totalCommentsLength: totalCommentsLength,
          });
        });
      });
    });
  });
};

exports.adminPostSearch = (req, res, next) => {
  const postData = req.body.postData;
  POST.postSearch(postData).then((posts) => {
    let totalView = 0;
    let totalComments = 0;
    let totalLikes = 0;

    for (let p of posts) {
      totalView =
        p.reaction && p.reaction.totalView
          ? totalView + +p.reaction.totalView
          : totalView + 0;
      totalComments =
        p.reaction && p.reaction.comments
          ? totalComments + +p.reaction.comments.length
          : totalComments + 0;
      totalLikes =
        p.reaction && p.reaction.likes
          ? totalLikes + +p.reaction.likes.length
          : totalLikes + 0;
    }

    res.render("admin/posts", {
      pageTitle: "Posts",
      posts: posts,
      totalView: totalView,
      totalComments: totalComments,
      totalLikes: totalLikes,
      path: "admin/posts",
    });
  });
};

exports.getPosts = (req, res, next) => {
  POST.adminGetPosts().then((posts) => {
    let totalView = 0;
    let totalComments = 0;
    let totalLikes = 0;

    for (let p of posts) {
      totalView =
        p.reaction && p.reaction.totalView
          ? totalView + +p.reaction.totalView
          : totalView + 0;
      totalComments =
        p.reaction && p.reaction.comments
          ? totalComments + +p.reaction.comments.length
          : totalComments + 0;
      totalLikes =
        p.reaction && p.reaction.likes
          ? totalLikes + +p.reaction.likes.length
          : totalLikes + 0;
    }

    res.render("admin/posts", {
      pageTitle: "Posts",
      posts: posts,
      totalView: totalView,
      totalComments: totalComments,
      totalLikes: totalLikes,
      path: "admin/posts",
    });
  });
};

// add post section
exports.getAddPost = (req, res, next) => {
  res.render("admin/add-post", {
    pageTitle: "add-post",
    path: "admin/add-post",
  });
};

exports.getUpdatePost = (req, res, next) => {
  const postId = req.params.postId;
  POST.adminGetPost(postId)
    .then((post) => {
      res.render("admin/edit-post", {
        pageTitle: `update ${post.title}`,
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        status: post.status,
        author: post.author,
        category: post.category,
        tags: post.tags,
        post: post.post,
        postId: post._id,
        path: "admin/posts",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUpdatePost = (req, res, next) => {
  console.log("update post");
  const title = req.body.title;
  const description = req.body.description;
  const image = req.file;
  const status = req.body.status;
  const author = req.body.author;
  const category = req.body.category;
  const tags = req.body.tags;
  const post = req.body.post;
  const postId = req.body.postId;
  const UpdateDate = new Date();
  let updatePost;
  if (image) {
    updatePost = new POST(
      title,
      image.path,
      description,
      status,
      author,
      category,
      tags,
      post,
      UpdateDate,
      null,
      postId,
      null
    );
  } else {
    updatePost = new POST(
      title,
      null,
      description,
      status,
      author,
      category,
      tags,
      post,
      UpdateDate,
      null,
      postId,
      null
    );
  }
  updatePost
    .save()
    .then((result) => {
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddPost = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.file.path;
  const status = req.body.status;
  const author = req.body.author;
  const category = req.body.category;
  const tags = req.body.tags;
  const post = req.body.post;
  const date = new Date();
  const newPost = new POST(
    title,
    imageUrl,
    description,
    status,
    author,
    category,
    tags,
    post,
    null,
    date,
    null,
    null
  );
  newPost.save().then((result) => {
    res.redirect("/admin/posts");
  });
};

// controll posts
exports.getDeletePost = (req, res, next) => {
  const postId = req.params.postId;
  POST.adminDeletePost(postId)
    .then((result) => {
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUpdateComment = (req, res, next) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const comment = req.body.comment;
  const reply = req.body.reply;
  POST.postCommentUpdate(postId, commentId, comment, reply).then((result) => {
    res.redirect("/admin/comments");
  });
};

exports.getLikesOfSingleUser = (req, res, next) => {
  const userEmail = req.params.userEmail;
  USER.getLikesOfSingleUser(userEmail).then((posts) => {
    res.render("admin/likesOfSingleUser", {
      pageTitle: userEmail,
      user: { email: userEmail },
      posts: posts,
      path: "admin/users",
    });
  });
};

exports.postSendEmail = (req, res, next) => {
  const userEmail = req.body.userEmail;
  const subject = req.body.subject;
  const textEmail = req.body.textEmail;
  transport
    .sendMail({
      from: "jsmag.ir@gmail.com",
      to: userEmail,
      subject: subject,
      html: textEmail,
    })
    .then((result) => {
      res.redirect("/admin/comments");
    });
};

exports.getCommentsOfSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  POST.getCommentsOfSinglePost(postId).then((commentsWithPost) => {
    res.render("admin/commentsOfSinglePost", {
      pageTitle: commentsWithPost.post.title,
      post: commentsWithPost.post,
      comments: commentsWithPost.comments,
      path: "admin/comments",
    });
  });
};
