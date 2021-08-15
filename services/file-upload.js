const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-east-1",
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime type, only jpeg and png"), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: "travel-log-map",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TRAVEL_LOG_FILES" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "/" + file.originalname);
    },
  }),
});

module.exports = upload;
