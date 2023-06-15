const express = require("express");
const app = express();

const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const db = require("./util/database");
const USER = require("./model/user");
const adminRoutes = require("./router/admin");
const blogRoutes = require("./router/blog");
const authRoutes = require("./router/auth");
const apiRoutes = require("./router/api");

const session = require("express-session");

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/images/posts",
  express.static(path.join(__dirname, "/public/images/posts"))
);
app.use(
  "/public/images/slides",
  express.static(path.join(__dirname, "/public/images/slides"))
);
app.use(
  "/public/images/users",
  express.static(path.join(__dirname, "/public/images/users"))
);
app.use(
  "/public/files/image",
  express.static(path.join(__dirname, "/public/files/image"))
);
app.set("view engine", "ejs");
app.set("views", "view");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "im god of node.js",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      // mongoUrl:
      // "mongodb://root:XayVTOf9JCGa9KBDTQC5u97b@esme.iran.liara.ir:32785/my-app?authSource=admin",
      dbName: "jsmag",
      collectionName: "sessions",
    }),
  })
);
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  } else {
    USER.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          console.log("not find");
          req.session.destroy();
          next();
        } else {
          req.user = user;
          next();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/${req.params.type}/${req.params.path}`);
  },
  filename: function (req, file, cb) {
    const date = new Date().toLocaleString("fa-IR-u-nu-latn");
    const newVersionOfDate = date
      .replace(/:/g, "-")
      .replace(/[/]/g, "&")
      .replace(/ /g, "");
    const uniqueSuffix = newVersionOfDate + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage });

const uploadProfile = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
});

app.use(cookieParser());
app.use(express.json());

app.post(
  "/admin/setting/upload",
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `./public/files/${req.body.type}`);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    }),
  }).single("file")
);

app.post("/admin/add-post/:type/:path", upload.single("image"));
app.post("/admin/setting/slider/:type/:path", upload.single("image"));
app.post("/admin/posts/update-post/:type/:path", upload.single("image"));
// app.post("/blog/setting/profile/:type/:path", uploadProfile.single("image"));
app.post("/blog/setting/profile/:type/:path", uploadProfile.single("image"));

//   const password = "imFuckingGodOfNode.js";

app.use(blogRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use(apiRoutes);

app.use((req, res, next) => {
  res.render("blog/404", { pageTitle: "صفحه مورد نظر شما پیدا نشد" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("blog/500", { pageTitle: "500 Error Server" });
});

db.connectToServer(function () {
  app.listen(4000, () => {
    console.log("server started on 3000 port");
  });
});
