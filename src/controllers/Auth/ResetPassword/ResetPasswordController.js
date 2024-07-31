import prisma from "../../../config/Prisma.js";
import nodemailer from "nodemailer";

import bcrypt from "bcryptjs";
// Fungsi untuk menghasilkan OTP 6 digit
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Fungsi untuk menghitung waktu kedaluwarsa OTP
const calculateExpiry = () => {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 5); // Kedaluwarsa dalam 5 menit
  return expiryDate;
};

export const CreateOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email diperlukan" });
  }

  try {
    const findUser = await prisma.auth.findUnique({
      where: {
        email,
      },
    });

    if (!findUser) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    const otp = generateOtp(); // Hasilkan OTP
    console.log("OTP yang dihasilkan:", otp);

    const expiryDate = calculateExpiry();

    await prisma.otp.upsert({
      where: { email },
      update: { code: otp, expiresAt: expiryDate, authId: findUser.id },
      create: { email, code: otp, expiresAt: expiryDate, authId: findUser.id },
    });

    const transporter = nodemailer.createTransport({
      host: "103.76.129.70",
      port: 587,
      auth: {
        user: process.env.EMAIL_SMTP,
        pass: process.env.EMAIL_PASSWORD,
      },

      tls: {
        rejectUnauthorized: false,
      },
 
    });

    // Persiapkan opsi email
    const mailOptions = {
      from: "no-reply@boezangapple.com",
      to: email,
      subject: "OTP Anda untuk Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; color: black; background-color: white; padding: 20px; border: 1px solid black;">
          <h2 style="text-align: center;">Boezang Apple</h2>
          <p style="font-size: 16px;">Anda telah meminta OTP untuk mereset kata sandi Anda.</p>
          <p style="font-size: 24px; font-weight: bold; text-align: center;">${otp}</p>
          <p style="font-size: 16px;">OTP ini akan berlaku selama 5 menit.</p>
          <p style="text-align: center;">Terima kasih!</p>
        </div>
      `,
    };

    // Kirim email dengan OTP
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP berhasil dikirim", status: 200 });
  } catch (error) {
    console.error("Error saat mengirim OTP:", error);
    res.status(500).json({ message: "Gagal mengirim OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email dan kode OTP diperlukan" });
  }

  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Kode OTP tidak valid atau sudah kedaluwarsa" });
    }

    await prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    res.status(200).json({ message: "OTP berhasil diverifikasi", status: 200 });
  } catch (error) {
    console.error("Error saat memverifikasi OTP:", error);
    res.status(500).json({ message: "Gagal memverifikasi OTP" });
  }
};

export const ResetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan kata sandi diperlukan" });
  }

  try {
    // Temukan pengguna berdasarkan email
    const user = await prisma.auth.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    // Hash kata sandi baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Perbarui kata sandi pengguna
    await prisma.auth.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Kata sandi berhasil diperbarui" });
  } catch (error) {
    console.error("Error saat mereset kata sandi:", error);
    res.status(500).json({ message: "Gagal mereset kata sandi" });
  }
};
