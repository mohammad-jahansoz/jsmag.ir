const bcrypt = require("bcryptjs");
const USER = require("../model/user");
const crtpto = require("node:crypto");
const nodemailer = require("nodemailer");
const { getDb } = require("../util/database");
require("dotenv").config();
const os = require("os");
const getGoogleUrl = require("../util/getGoogleUrl");

let transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  tls: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  // service: "gmail",
  // auth: {
  //   user: "jsmag.ir@gmail.com",
  //   pass: "ggpuibgbciiyvrti",
  // },
});

exports.getAdminLogin = (req, res, next) => {
  res.render("auth/adminLogin");
};

exports.getAdminLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/admin/login");
};

exports.postAdminLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  return getDb()
    .collection("users")
    .findOne({ username: username })
    .then((adminUser) => {
      if (adminUser) {
        bcrypt.compare(password, adminUser.password).then((doMatch) => {
          if (doMatch) {
            req.session.isAdmin = true;
            return req.session.save((err) => {
              transport.sendMail({
                from: "jsmag <support@jsmag.ir>",
                to: "big_mamadi@yahoo.com",
                subject: "ورود به اکانت",
                html: "<h1>some one login to jsmag!be aware</h1>",
              });
              console.log(err);
              res.redirect("/admin/posts");
            });
          } else {
            res.redirect("/admin/login");
          }
        });
      } else {
        res.send(os.networkInterfaces());
        res.end();
      }
    });
};

exports.getLogOut = (req, res, next) => {
  return req.session.destroy(function (err) {
    res.redirect("/");
  });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    googleOAuthLogin: getGoogleUrl.request_get_auth_code_url,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  USER.findByEmail(email)
    .then((user) => {
      if (user) {
        if (user.verified) {
          bcrypt.compare(password, user.password).then((doMatch) => {
            if (doMatch) {
              console.log("welcome to your acc");
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.cookie.maxAge = 43707000000;

              return req.session.save((err) => {
                console.log(err);
                res.redirect("/");
              });
            } else {
              console.log("password wrong!");
              res.render("auth/loginFailPassword", { pageTitle: "login Fail" });
            }
          });
        } else {
          transport.sendMail({
            from: "jsmag <support@jsmag.ir>",
            to: email,
            subject: "ایمیل فعال سازی",
            html: `<h1>با تشکر از ثبت نام شما در جی اس مگ</h1>
          <h3> برای فعال سازی اکانت خود روی لینک زیر کلیک کنید!</h3>
          <a href="https://jsmag.ir/auth/verify/${email}/${user.token}">لینک فعال سازی</a>
          <hr>
          <p>این ایمیل به صورت خودکار توسط سرور ارسال شده</p>
          <a href="https://jsmag.ir/">JSMAG.IR</a>
          `,
          });
          res.render("auth/loginFailEmail", {
            pageTitle: "login Fail",
            email: email,
          });
        }
      } else {
        console.log("cant find with this email or not verified!");
        res.render("auth/loginFailEmail", {
          pageTitle: "login Fail",
          email: email,
        });
      }
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const token = crtpto.randomBytes(32).toString("hex");
  const date = new Date();
  return bcrypt.genSalt(12, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.log(err);
        next(new Error(err));
      } else {
        const user = new USER(
          email,
          hash,
          date,
          null,
          null,
          null,
          "jsmag",
          null,
          token,
          false
        );
        user
          .save()
          .then((result) => {
            transport.sendMail({
              from: "jsmag <support@jsmag.ir>",
              to: email,
              subject: "ایمیل فعال سازی",
              html: `<h1>با تشکر از ثبت نام شما در جی اس مگ</h1>
              <h3> برای فعال سازی اکانت خود روی لینک زیر کلیک کنید!</h3>
              <a href="https://jsmag.ir/auth/verify/${email}/${token}">لینک فعال سازی</a>
              <hr>
              <p>این ایمیل به صورت خودکار توسط سرور ارسال شده</p>
              <a href="https://jsmag.ir/">JSMAG.IR</a>
              `,
            });
            console.log("new user signin website!");
            res.render("auth/signUpConfirm", { pageTitle: "خوش آمدید" });
          })
          .catch((err) => {
            console.log(err);
            next(new Error(err));
          });
      }
    });
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signUp", {
    pageTitle: "SignUp",
  });
};

exports.getPasswordRecovery = (req, res, next) => {
  res.render("auth/passwordRecovery", {
    pageTitle: "password Recovery",
  });
};

exports.postPasswordRecovery = (req, res, next) => {
  console.log(req.body.email);
  const email = req.body.email.toLowerCase();
  console.log(email);
  const token = crtpto.randomBytes(32).toString("hex");
  USER.postPasswordRecovery(email, token).then((user) => {
    console.log(email);
    if (user) {
      transport
        .sendMail({
          from: "jsmag <support@jsmag.ir>",
          to: email,
          subject: "بازیابی رمز عبور",
          html: `
        <h1>شما درخواست بازیابی رمز عبور را داده اید </h1>
        <h3>با کلیک روی لینک زیر به صفحه بازیابی رمز عبور رفته و رمز جدید را وارد کنید. این ایمیل را در اختیار کسی نگذارید !</h3>
        <p>
        برای بازیابی رمز عبور <a href="http://jsmag.ir/auth/newPassword/${token}">اینجا کلیک کنید</a>
        </p>
        <hr>
          <p>در صورتی که شما درخواست بازیابی رمز عبور نداده اید این ایمیل را نادیده بگیرید </p>
          <a href="https://jsmag.ir/">JSMAG.IR</a>
        `,
        })
        .then((result) => {
          res.render("auth/passwordRecoverySend", {
            pageTitle: "بازیابی رمز عبور",
          });
        });
    } else {
      res.render("auth/passwordRecoveryFail", {
        pageTitle: "بازیابی رمز عبور",
      });
    }
  });
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  const email = req.body.email;

  return bcrypt.genSalt(12, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.log(err);
        next(new Error(err));
      } else {
        USER.postNewPassword(userId, token, hash)
          .then((result) => {
            if (result) {
              transport.sendMail({
                from: "jsmag <support@jsmag.ir>",
                to: email,
                subject: "تغییر رمز عبور",
                html: `
                <h1>رمز عبور شما با موفقیت تغییر یافت</h1>
                <p>
                برای ورود به اکانت خود <a href="http://jsmag.ir/auth/login">اینجا کلیک کنید</a>
                </p>
                <hr>
          <a href="https://jsmag.ir/">JSMAG.IR</a>
        `,
              });
              res.render("auth/newPasswordSet", {
                pageTitle: "بازیابی رمز عبور",
              });
            } else {
              res.render("auth/newPasswordFail", {
                pageTitle: "بازیابی رمز عبور",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  USER.getNewPassword(token).then((user) => {
    if (user) {
      res.render("auth/newPassword", {
        pageTitle: "new Password",
        userId: user._id,
        token: token,
        email: user.email,
      });
    } else {
      res.render("auth/newPasswordFail", { pageTitle: "بازیابی رمز عبور" });
    }
  });
};

exports.googleOAuthHandler = async (req, res, next) => {
  const authorization_token = req.query;

  try {
    // ! get access token using authorization token
    const response = await getGoogleUrl.get_access_token(
      authorization_token.code
    );

    // get access token from payload
    const { access_token } = response.data;
    const user = await getGoogleUrl.get_profile_data(access_token);
    const user_data = user.data;

    const userData = await getDb()
      .collection("users")
      .findOne({ email: user_data.email });
    if (!userData) {
      if (!user_data.email_verified) {
        return res
          .status(403)
          .send(
            "اکانت جیمیل شما وریفای نشده است!ابتدا اکانت گوگل خود را تایید کنید سپس در سایت ما ثبت نام کنید!"
          );
      }
      const date = new Date();
      const newUser = new USER(
        user_data.email,
        null,
        date,
        null,
        user_data.name,
        user_data.picture,
        "google",
        user_data.sub,
        null,
        false
      );
      newUser.save();
      console.log("welcome to your acc by google");
      req.session.isLoggedIn = true;
      req.session.user = newUser;
      req.session.cookie.maxAge = 43707000000;

      return req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    } else {
      if (userData.googleId) {
        const oldUser = await getDb()
          .collection("users")
          .findOne({ email: user_data.email, googleId: user_data.sub });
        if (oldUser) {
          console.log("welcome to your acc by google");
          req.session.isLoggedIn = true;
          req.session.user = oldUser;
          req.session.cookie.maxAge = 43707000000;

          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          res.redirect("/auth/login");
        }
      } else {
        USER.addOAuth(
          userData._id,
          user_data.sub,
          user_data.picture,
          user_data.name
        ).then(() => {
          req.session.isLoggedIn = true;
          req.session.user = userData;
          req.session.cookie.maxAge = 43707000000;

          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
};

exports.verifyAccount = (req, res, next) => {
  const email = req.params.email;
  const token = req.params.token;
  USER.verifyAccount(email, token).then((user) => {
    if (user) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.cookie.maxAge = 43707000000;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    } else {
      res.render("auth/LoginFailVerify", { pageTitle: "verify Fail" });
    }
  });
};
