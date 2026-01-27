import nodemailer from "nodemailer";
import { env } from "../../../config/env";

type SendMailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function hasSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

let transporter: nodemailer.Transporter | null = null;
let verified = false;

function getTransporter() {
  if (!hasSmtpConfigured()) return null;

  if (!transporter) {
    const pass = env.SMTP_PASS.replace(/\s/g, ""); // phòng trường hợp bạn copy có space

    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,              // smtp.gmail.com
      port: Number(env.SMTP_PORT),      // 587
      secure: Number(env.SMTP_PORT) === 465,
      auth: { user: env.SMTP_USER, pass },
      requireTLS: true,                 // tốt cho 587
      logger: true,                     // debug
      debug: true,                      // debug
    });
  }

  return transporter;
}

export async function sendMail({ to, subject, text, html }: SendMailArgs) {
  const t = getTransporter();

  if (!t) {
    console.log("[MAILER:DEV] SMTP not configured. Email to:", to);
    console.log("[MAILER:DEV] Subject:", subject);
    console.log("[MAILER:DEV] Text:", text);
    return;
  }

  if (!verified) {
    await t.verify();        // nếu sai user/pass sẽ fail ngay tại đây với thông báo rõ
    verified = true;
    console.log("[MAILER] SMTP verify OK");
  }

  await t.sendMail({ from: env.SMTP_FROM, to, subject, text, html });
}

export async function sendForgotPasswordOtpEmail(to: string, otp: string) {
  const subject = "Mã OTP khôi phục mật khẩu";
  const text = `Mã OTP của bạn là: ${otp}\nMã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2>Mã OTP khôi phục mật khẩu</h2>
      <p>Mã OTP của bạn là:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px">${otp}</div>
      <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;
  await sendMail({ to, subject, text, html });
}
