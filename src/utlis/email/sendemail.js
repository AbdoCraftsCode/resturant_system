import nodemailer from "nodemailer"




export const sendemail = async ({
    to = [],
    subject = "",
    text = "",
    html = "",
    attachments = [],
   

} = {}) => {




    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });



    const info = await transporter.sendMail({
        from: `"merba3 👻" <${process.env.EMAIL}>`,
        replyTo: "daana652@gmail.com",
        to,
        subject,
        text,
        html,
        attachments,
    });



}





