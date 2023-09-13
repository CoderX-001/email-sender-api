import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import logger from "morgan";
import nodemailer from "nodemailer";

config();
const app = express();
const port = 5000;

// MIDDLEWARES
app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.post("/api/send/email", async (req, res) => {
  const { from, to, authData, host, port, subject, html, text } = req.body;
  if (!from || !to || !host || !port || !subject || (!html && !text)) {
    return res
      .status(404)
      .json({ status: "Error", message: "Required items not found!" });
  }

  if (
    !authData ||
    typeof authData !== "object" ||
    typeof authData.user === "undefined" ||
    typeof authData.pass === "undefined"
  ) {
    return res
      .status(404)
      .json({ status: "Error", message: "Invalid authData" });
  }

  console.log(host, authData.user, authData.pass);
  try {
    // Nodemailer smtp transport service
    const transporter = nodemailer.createTransport({
      // service: 'gmail',
      host,
      port,
      secure: true,
      auth: {
        user: authData.user,
        pass: authData.pass,
      },
    });

    // Informations in the registration email to be sent to the user
    const mailOptions = {
      from,
      to,
      subject,
      html,
      text,
    };

    // Send email after token has been save to the database
    const sendEmail = await transporter.sendMail(mailOptions);
    if (!sendEmail)
      return res
        .status(500)
        .json({ error: "Something went wrong. Try again!" });

    res.status(201).json({
      success:
        "Email sent. If you do not see the email in your inbox, check your spam.",
    }); // Send response to the client-side
  } catch (err) {
    console.log(err); // throws an error message if any
  }
});

app.all("*", (req, res) => {
  res
    .status(404)
    .json({ status: "Error", message: "This resource does not exist!" });
});

// LISTEN TO SERVER PORT
app.listen(port, (err) => {
  if (err) return console.log(err.message);
  console.log("Server running...");
});
