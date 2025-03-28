
import { nanoid, customAlphabet } from "nanoid";
import { EventEmitter } from "node:events";
import { sendemail } from "../email/sendemail.js";
import { vervicaionemailtemplet } from "../temblete/vervication.email.js";
import { generatehash } from "../security/hash.security.js";
import Usermodel from "../../DB/models/User.model.js";
export const Emailevent = new EventEmitter({})
import axios from 'axios';

Emailevent.on("confirmemail", async (data) => {
    const { email } = data;

    const otp = customAlphabet("0123456789", 6)();


    const html = vervicaionemailtemplet({ code: otp });

    const emailOTP = generatehash({ planText: `${otp}` });

    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); 

 


    await Usermodel.updateOne(
        { email },
        {
            emailOTP,
            otpExpiresAt,
            attemptCount: 0, 
        }
    );

   
    await sendemail({ to: email, subject: "Confirm Email", html });

    console.log("Email sent successfully!");
});


// Emailevent.on("forgetpassword", async (data) => {
//     const { email } = data;

//     const otp = customAlphabet("0123456789", 6)();


//     const html = vervicaionemailtemplet({ code: otp });

//     const forgetpasswordOTP = generatehash({ planText: `${otp}` });


//     const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); 

//     await Usermodel.updateOne(
//         { email },
//         {
//             forgetpasswordOTP,
//             otpExpiresAt,
//             attemptCount: 0, 
//         }
//     );

//     await sendemail({ to: email, subject: "forgetpassword", html });

//     console.log("Email sent successfully!");
// }); 

Emailevent.on("forgetpassword", async (data) => {
    const { email } = data;

    const otp = customAlphabet("0123456789", 6)(); // إنشاء كود OTP عشوائي

    const html = `
        <h1>🔐 Reset Your Password</h1>
        <p>Dear User,</p>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <h2 style="color: #ff6600;">${otp}</h2>
        <p>This OTP is valid for <strong>2 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Support Team</p>
    `;

    const forgetpasswordOTP = generatehash({ planText: `${otp}` });
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); 

    await Usermodel.updateOne(
        { email },
        {
            forgetpasswordOTP,
            otpExpiresAt,
            attemptCount: 0, 
        }
    );

    await sendemail({ to: email, subject: "Password Reset Request", html });

    console.log(`Password reset email sent successfully to ${email}`);
});




Emailevent.on("jobAccepted", async (data) => {
    const { email, jobTitle } = data;

    const html = `
        <h1>🎉 Congratulations!</h1>
        <p>Dear Candidate,</p>
        <p>We are pleased to inform you that you have been <strong>accepted</strong> for the position of <strong>${jobTitle}</strong>.</p>
        <p>We will contact you soon with further details.</p>
        <p>Best regards,<br>HR Team</p>
    `;

    await sendemail({ to: email, subject: "Job Application Accepted", html });

    console.log(`Job acceptance email sent successfully to, ${ email }`);
});
Emailevent.on("jobRejected", async (data) => {
    const { email, jobTitle } = data;

    const html = `
        <h1>😞 Job Application Update</h1>
        <p>Dear Candidate,</p>
        <p>We appreciate your interest in the <strong>${jobTitle}</strong> position. However, after careful consideration, we regret to inform you that your application has not been selected at this time.</p>
        <p>We encourage you to apply for other opportunities in the future.</p>
        <p>Best regards,<br>HR Team</p>
    `;

    await sendemail({ to: email, subject: "Job Application Update", html });

    console.log(`Job rejection email sent successfully to ${ email }`);
});







