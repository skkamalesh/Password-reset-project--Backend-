const UserModel = require("../model/user");
const Auth = require("../common/auth");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const createUser = async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      req.body.password = await Auth.hashPassword(req.body.password);
      await UserModel.create(req.body);

      res.status(201).send({
        message: "User created successfully",
      });
    } else {
      res
        .status(400)
        .send({ message: `User with ${req.body.email} already exists` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (user && (await Auth.hashCompare(password, user.password))) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: `${email} does not exists`,
      });
    }

    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.BACKEND_URL}/reset-password/${user._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASS,
      },
    });

    var mailOptions = {
      from: process.env.MAIL_NAME,
      to: email,
      subject: "Password Reset Link",
      html: `<p>Click on the following link to reset your password:<a href="${resetLink}">ResetLink</a></p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).send({ error: "Error updating database" });
  }
};

const resetPasswordLink = async (req, res) => {
  const { id, token } = req.params;

  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    return res.status(404).json({
      status: `User does not exists`,
    });
  }

  const secret = process.env.JWT_SECRET + user.password;
  try {
    const verify = jwt.verify(token, secret);

    res.render("index", { email: verify.email, status: "Not verified" });
  } catch (error) {
    res.send("Link Expired");
  }
};

const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    return res.status(404).send({ message: "User not exists" });
  }

  const secret = process.env.JWT_SECRET + user.password;
  try {
    const verify = jwt.verify(token, secret);

    const encryptpassword = await Auth.hashPassword(password);

    await UserModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptpassword,
        },
      }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

module.exports = {
  createUser,
  forgetPassword,
  resetPassword,
  resetPasswordLink,
  loginUser,
};
