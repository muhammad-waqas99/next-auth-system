import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer"

export default function sendMail(email:string ,token:string){

  const TOKEN = process.env.MAILTRAPTOKEN!;
  const verificationUrl = process.env.DOMAIN +"/verify-email?token=" +`${token}`;

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
const recipients = [
  email,
];

transport.sendMail({
    from: sender,
    to: recipients,
    subject: "You are awesome! Verify your email",

    text: `Congrats for sending test email with Mailtrap! Please verify your email here: ${verificationUrl}`, 
    
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Congrats for sending test email with Mailtrap!</p>
            <p>Apna account verify karne ke liye neeche diye gaye button par click karein:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="font-size: 12px; color: #666;">Agar button kaam nahi kar raha, to is link ko copy karein:<br> ${verificationUrl}</p>
        </div>
    `,
    category: "Integration Test", 
}).then(console.log, console.error);


}