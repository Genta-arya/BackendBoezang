import nodemailer from "nodemailer";

// Ensure environment variables are loaded, if using dotenv

export const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Use environment variable
    port: 587,
    auth: {
      user: process.env.EMAIL_SMTP, // Use environment variable
      pass: process.env.EMAIL_PASSWORD, // Use environment variable
    },
    secure: false, // Set to true if using port 465
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Useful for debugging, can be set to false in production
  });

  const mailOptions = {
    from: "no-reply@boezangapple.com", // Use environment variable
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
