import { asyncHandelr } from "../../../utlis/response/error.response.js";
// import { Emailevent} from "../../../utlis/events/email.emit.js";
import *as dbservice from "../../../DB/dbservice.js"
import Usermodel, { providerTypes, roletypes } from "../../../DB/models/User.model.js";
import { comparehash, encryptData, generatehash } from "../../../utlis/security/hash.security.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { OAuth2Client } from "google-auth-library";
import { generatetoken } from "../../../utlis/security/Token.security.js";


import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || "$2y$10$q76UhyFYQryENlRau7zuxuc34jwZt8B40JHyMF6v5IK/5p6pv9byq";
const AUTHENTICA_OTP_URL = "https://api.authentica.sa/api/v1/send-otp";

async function sendOTP(phone) {
    try {
        const response = await axios.post(
            AUTHENTICA_OTP_URL,
            {
                phone: phone,
                method: "whatsapp",  
                number_of_digits: 6,
                otp_format: "numeric",
                is_fallback_on: 0
            },
            {
                headers: {
                    "X-Authorization": AUTHENTICA_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }
        );

        console.log("✅ OTP تم إرساله بنجاح:", response.data);
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.response?.data || error.message);
    }
}



export const signup = asyncHandelr(async (req, res, next) => {
    const { lastName, firstName, email, password, mobileNumber, city } = req.body;

    // ✅ التحقق من وجود المستخدم مسبقًا (البريد أو الهاتف)
    const checkuser = await dbservice.findOne({
        model: Usermodel,
        filter: {
            $or: [{ email }, { mobileNumber }]  // 🔥 تصحيح الخطأ
        }
    });

    if (checkuser) {
        if (checkuser.email === email) {
            return next(new Error("Email already exists", { cause: 400 }));
        }
        if (checkuser.mobileNumber === mobileNumber) {
            return next(new Error("Phone number already exists", { cause: 400 }));
        }
    }

    // ✅ تشفير كلمة المرور
    const hashpassword = await generatehash({ planText: password });

    // ✅ إنشاء المستخدم الجديد
    const user = await dbservice.create({
        model: Usermodel,
        data: { lastName, firstName, password: hashpassword, email, mobileNumber, city }
    });

    // ✅ إرسال OTP
    try {
        await sendOTP(mobileNumber);
        console.log(`📩 OTP تم إرساله إلى ${mobileNumber}`);
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.message);
    }

    
    return successresponse(res, "User created successfully, OTP sent!", 201);
});


export const sendotpphone = asyncHandelr(async (req, res, next) => {
    const { phone } = req.body;

    const checkuser = await dbservice.findOne({
        model: Usermodel,
        filter: {
            mobileNumber: phone,  
            isConfirmed: true
        },
    });

    if (!checkuser) {
        return next(new Error("Phone not exist", { cause: 400 }));
    }

    try {
        await sendOTP(phone); 
        console.log(`📩 OTP تم إرساله إلى ${phone}`);
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.message);
        return next(new Error("Failed to send OTP", { cause: 500 }));
    }

    return successresponse(res, "User found successfully, OTP sent!", 201);
});






export const signupwithGmail = asyncHandelr(async (req, res, next) => {
    const { idToken } = req.body;
    const client = new OAuth2Client();

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CIENT_ID,
        });
        return ticket.getPayload();
    }

    const payload = await verify();
    console.log("Google Payload Data:", payload);

    const { name, email, email_verified, picture } = payload;

    if (!email) {
        return next(new Error("Email is missing in Google response", { cause: 400 }));
    }
    if (!email_verified) {
        return next(new Error("Email not verified", { cause: 404 }));
    }

    let user = await dbservice.findOne({
        model: Usermodel,
        filter: { email },
    });

    if (user?.provider === providerTypes.system) {
        return next(new Error("Invalid account", { cause: 404 }));
    }

    if (!user) {
        user = await dbservice.create({
            model: Usermodel,
            data: {
                email,
                username: name,
                profilePic: { secure_url: picture },
                isConfirmed: email_verified,
                provider: providerTypes.google,
            },
        });
    }

    const access_Token = generatetoken({
        payload: { id: user._id },
        signature: user?.role === roletypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
    });

    const refreshToken = generatetoken({
        payload: { id: user._id },
        signature: user?.role === roletypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: 31536000,
    });

    return successresponse(res, "Login successful", 200, { access_Token, refreshToken });
});