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
  const APP_NAME = "Expense Manager";
  const BRAND_COLOR = "#2563EB"; // chỉnh theo brand của bạn
  const subject = `${APP_NAME} — Mã OTP đặt lại mật khẩu`;

  const text = [
    `Xin chào,`,
    ``,
    `Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên ${APP_NAME}.`,
    ``,
    `Mã OTP của bạn: ${otp}`,
    `Mã có hiệu lực trong 10 phút.`,
    ``,
    `Vui lòng không chia sẻ mã này với bất kỳ ai.`,
    `Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,
    ``,
    `— ${APP_NAME}`,
  ].join("\n");

  const html = `
  <div style="margin:0;padding:0;background:#f6f8fc;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8fc;padding:32px 12px;">
      <tr>
        <td align="center">
          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
            <!-- Header -->
            <tr>
              <td style="padding:12px 4px 18px 4px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#64748b;">
                  <span style="font-weight:700;color:#0f172a;">${APP_NAME}</span>
                </div>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;">
                <!-- Top accent -->
                <div style="height:6px;background:${BRAND_COLOR};"></div>

                <div style="padding:28px 28px 10px 28px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:20px;font-weight:800;letter-spacing:-0.2px;">
                    Mã OTP đặt lại mật khẩu
                  </div>

                  <div style="font-family:Arial,Helvetica,sans-serif;color:#475569;font-size:14px;line-height:1.7;margin-top:10px;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    Vui lòng nhập mã OTP bên dưới để tiếp tục.
                  </div>

                  <!-- OTP block -->
                  <div style="margin:18px 0 8px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;text-align:center;">
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;
                                font-size:32px;font-weight:800;letter-spacing:10px;color:#0f172a;">
                      ${otp}
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;margin-top:10px;">
                      Mã có hiệu lực trong <b style="color:#0f172a;">10 phút</b>.
                    </div>
                  </div>

                  <!-- Security note -->
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#475569;margin-top:10px;">
                    <b style="color:#0f172a;">Lưu ý bảo mật:</b> Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.
                  </div>

                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#475569;margin-top:8px;">
                    Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email — không có thay đổi nào được áp dụng.
                  </div>
                </div>

                <!-- Footer inside card -->
                <div style="padding:14px 28px 22px 28px;">
                  <div style="height:1px;background:#eef2f7;margin:6px 0 14px 0;"></div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;line-height:1.6;">
                    Email này được gửi tự động từ hệ thống ${APP_NAME}. Vui lòng không trả lời email này.
                  </div>
                </div>
              </td>
            </tr>

            <!-- Outer footer -->
            <tr>
              <td style="padding:16px 6px 0 6px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;line-height:1.6;text-align:center;">
                  © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  await sendMail({ to, subject, text, html });
}


