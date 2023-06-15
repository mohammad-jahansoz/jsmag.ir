const POST = require("../model/post");
const USER = require("../model/user");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { getDb } = require("../util/database");
const sharp = require("sharp");

exports.getSetting = (req, res, next) => {
  res.render("blog/setting", { pageTitle: "تنظیمات اکانت" });
};

exports.getProfileSetting = (req, res, next) => {
  res.render("blog/profile-setting", {
    pageTitle: "تنظیمات پروفایل",
    user: req.user,
  });
};

exports.postProfileSetting = async (req, res, next) => {
  let imageUrl = null;
  if (req.file) {
    const fileName = Date.now() + "-" + req.file.originalname;
    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 500, height: 500 })
      .toFile(`./public/images/users/${fileName}`);
    imageUrl = `/public/images/users/${fileName}`;
  }

  const name = req.body.name;

  try {
    const user = new USER(
      req.user.email,
      req.user.password,
      req.user.date,
      req.user._id,
      name,
      imageUrl
    );
    await user.save();
    res.redirect("/setting/profile");
  } catch (error) {
    console.log(error);
  }
};

exports.getPosts = (req, res, next) => {
  const PAGE_NUMBER = +req.query.page || 1;
  const NUMBER_PRODUCT_IN_PAGE = 9;

  let sort;
  if (req.query.sort == "popular") {
    sort = true;
  } else {
    sort = false;
  }
  POST.userGetPosts(sort, PAGE_NUMBER).then((data) => {
    const TOTAL_PAGE = Math.ceil(data.totalPosts / NUMBER_PRODUCT_IN_PAGE);

    POST.getSliders().then((slides) => {
      res.render("blog/index", {
        pageTitle: "جی اس مگ jsmag.ir",
        posts: data.posts,
        slides: slides,
        sort: sort,
        search: false,
        totalPage: TOTAL_PAGE,
        hasNext: TOTAL_PAGE > PAGE_NUMBER ? true : false,
        hasPrevious: PAGE_NUMBER != 1 && PAGE_NUMBER != 2 ? true : false,
        previousNumber: PAGE_NUMBER - 1,
        nextNumber: PAGE_NUMBER + 1,
        currentPage: PAGE_NUMBER,
      });
    });
  });
};

exports.getLikesOfSingleUser = (req, res, next) => {
  const email = req.params.email;
  USER.getLikesOfSingleUser(email).then((posts) => {
    res.render("blog/likes-setting", {
      pageTitle: "لایک ها",
      posts: posts,
    });
  });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  POST.getPost(postId)
    .then((post) => {
      POST.getRelatdPosts(post.category, postId).then((relatedPosts) => {
        let like;
        if (!req.user) {
          like = req.cookies[postId] ? "true" : "false";
        } else {
          for (let i = 0; i < post.reaction.likes.length; i++) {
            if (post.reaction.likes[i].email == req.user.email) {
              like = "true";
            }
          }
        }
        res.render("blog/post", {
          pageTitle: post.title,
          post: post,
          like: like,
          relatedPosts: relatedPosts,
          user: req.user || false,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getPostsByCategory = (req, res, next) => {
  const PAGE_NUMBER = +req.query.page || 1;
  const NUMBER_PRODUCT_IN_PAGE = 9;

  let sort;
  if (req.query.sort == "popular") {
    sort = true;
  } else {
    sort = false;
  }
  const category = req.params.category;
  POST.userGetPostsByCategory(category, sort, PAGE_NUMBER).then((data) => {
    const TOTAL_PAGE = Math.ceil(data.totalPosts / NUMBER_PRODUCT_IN_PAGE);

    POST.getSliders().then((slides) => {
      res.render("blog/index", {
        pageTitle: "JSMAG.IR",
        posts: data.posts,
        slides: slides,
        sort: sort,
        search: false,
        totalPage: TOTAL_PAGE,
        hasNext: TOTAL_PAGE > PAGE_NUMBER ? true : false,
        hasPrevious: PAGE_NUMBER != 1 && PAGE_NUMBER != 2 ? true : false,
        previousNumber: PAGE_NUMBER - 1,
        nextNumber: PAGE_NUMBER + 1,
        currentPage: PAGE_NUMBER,
      });
    });
  });
};

exports.postComment = (req, res, next) => {
  const comment = req.body.comment;
  const email = req.body.email.toLowerCase();
  const name = req.body.name;
  const postId = req.params.postId;
  const imageUrl = req.user
    ? req.user.imageUrl
    : "public\\images\\users\\1401&9&20،‏20-28-48-default-profile3.jpg";
  const date = new Date();
  POST.setComment(postId, email, date, comment, name, imageUrl)
    .then((result) => {
      console.log("set comment");
      res.redirect(`/post/${postId}`);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postSearch = (req, res, next) => {
  const searchedText = req.body.searchedText;
  POST.postSearch(searchedText).then((posts) => {
    POST.getSliders().then((slides) => {
      res.render("blog/index", {
        pageTitle: "نتیجه جستجو",
        posts: posts,
        slides: slides,
        search: true,
      });
    });
  });
};

exports.postLike = (req, res, next) => {
  const postId = req.params.postId;
  const date = new Date();
  const cookiePostLike = req.cookies[postId];
  if (!req.user) {
    POST.setLike(postId, "guest", date, cookiePostLike)
      .then((likeId) => {
        if (likeId) {
          res.cookie(postId, likeId, { maxAge: 43707000000 });
          res.end();
        } else {
          res.clearCookie(postId);
          res.end();
        }
      })
      .catch((err) => console.log(err));
  } else {
    POST.setLike(postId, req.user.email, date)
      .then((result) => {
        res.end();
      })
      .catch((err) => console.log(err));
  }
};
