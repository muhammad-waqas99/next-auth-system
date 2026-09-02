
import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer";

type EmailType = "verify" | "reset";

export default async function sendMail(
  email: string,
  token: string,
  emailType: EmailType
) {
  const TOKEN = process.env.MAILTRAPTOKEN!;

  let emailUrl = "";
  let subject = "";
  let text = "";
  let html = "";


  if (emailType === "verify") {
    emailUrl = `${process.env.DOMAIN}/verify-email?token=${token}`;

    subject = "Verify Your Email Address";

    text = `Please verify your email address by clicking this link: ${emailUrl}`;

    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        
        <h2 style="color: #333;">Email Verification</h2>

        <p>Thank you for creating an account with us.</p>

        <p>
          Please verify your email address by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${emailUrl}"
            style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;"
          >
            Verify Email Address
          </a>
        </div>

        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          ${emailUrl}
        </p>

      </div>
    `;
  }

 
  if (emailType === "reset") {
    emailUrl = `${process.env.DOMAIN}/reset-password?token=${token}`;

    subject = "Reset Your Password";

    text = `You requested to reset your password. Reset your password here: ${emailUrl}`;

    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        
        <h2 style="color: #333;">Reset Your Password</h2>

        <p>
          We received a request to reset the password for your account.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${emailUrl}"
            style="background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;"
          >
            Reset Password
          </a>
        </div>

        <p style="font-size: 12px; color: #666;">
          This password reset link will expire soon.
        </p>

        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          ${emailUrl}
        </p>

      </div>
    `;
  }

  const transport = Nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
    })
  );

  const sender = {
    address: "hello@demomailtrap.co",
    name: "Mailtrap Test",
  };

  const recipients = [email];

  await transport.sendMail({
    from: sender,
    to: recipients,
    subject,
    text,
    html,
    category: emailType === "verify"
      ? "Email Verification"
      : "Password Reset",
  });
}

