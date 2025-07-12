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
import { RestaurantModel } from "../../../DB/models/RestaurantSchema.model.js";
import { BranchModel } from "../../../DB/models/BranchopaSchema.model.js";
import { Emailevent } from "../../../utlis/events/email.emit.js";
dotenv.config();


const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || "$2y$10$ZHtIfchtuqASIn1YiPG5w.X6UFuzsOegpt6APriTklUBoZteB.dJe";
const AUTHENTICA_OTP_URL = "https://api.authentica.sa/api/v1/send-otp";

export async function sendOTP(phone) {
    try {
        const response = await axios.post(
            AUTHENTICA_OTP_URL,
            {
                phone: phone,
                method: "whatsapp",  // or "sms"
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

        console.log("✅ رد إرسال OTP:", response.data);
        console.log("📩 رد كامل من Authentica:", JSON.stringify(response.data, null, 2));
        console.log("🆔 session_id:", response.data?.data?.session_id);
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.response?.data || error.message);
    }
}




export const signup = asyncHandelr(async (req, res, next) => {
    const { username,   password, mobileNumber,  } = req.body;

  
    const checkuser = await dbservice.findOne({
        model: Usermodel,
        filter: {
            $or: [{ username }, { mobileNumber }]  
        }
    });

    if (checkuser) {
        if (checkuser.username === username) {
            return next(new Error("username already exists", { cause: 400 }));
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
        data: {  username, password: hashpassword,  mobileNumber,  }
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

export const registerRestaurant = asyncHandelr(async (req, res, next) => {
    const { fullName, email, phone,  subdomain, password } = req.body;

    // ✅ تحقق من تكرار subdomain و email
    const checkuser = await dbservice.findOne({
        model: Usermodel,
        filter: {
            $or: [{ subdomain }, { email }]
        }
    });

    if (checkuser) {
        if (checkuser.subdomain === subdomain) {
            return next(new Error("subdomain already exists", { cause: 400 }));
        }
        if (checkuser.email === email) {
            return next(new Error("email already exists", { cause: 400 }));
        }
    }

    // ✅ تشفير كلمة المرور
    const hashpassword = await generatehash({ planText: password });

    // ✅ إنشاء المستخدم الجديد
    const user = await dbservice.create({
        model: Usermodel,
        data: {
            fullName,
            password: hashpassword,
            email,
            phone,
          
            subdomain
        }
    });

    // ✅ بناء الرابط الديناميكي تلقائيًا
    const restaurantLink = `https://morezk12.github.io/Restaurant-system/#/restaurant/${user.subdomain}`;

    // ✅ دمج كل البيانات داخل كائن واحد لأن دالتك بتتعامل مع message فقط
    const allData = {
        message: "User created successfully",
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        // country: user.country,
        subdomain: user.subdomain,
        restaurantLink
    };
    Emailevent.emit("confirmemail", { email });
    // ✅ رجع كل البيانات داخل message عشان دالتك
    return successresponse(res, allData, 201);
});
  
export const createBranch = asyncHandelr(async (req, res, next) => {
    const {
        branchCode,
        branchName,
        country,
        city,
        phone,
        address,
        manager
    } = req.body;

    const userId = req.user.id; // لو عندك حماية بالتوكن

    const branch = await BranchModel.create({
        restaurant: userId,
        branchCode,
        branchName,
        country,
        city,
        phone,
        address,
        manager
    });

    return successresponse(res, {
        message: 'Branch created successfully',
        branch
    }, 201);
});

export const getBranches = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id; // لو عامل حماية بالتوكن

    // 📌 تحديد الصفحة الحالية وعدد العناصر في كل صفحة
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // 📌 إجمالي عدد الفروع الخاصة بالمطعم
    const totalBranches = await BranchModel.countDocuments({ restaurant: userId });

    // 📌 جلب الفروع مع الباجينيشن
    const branches = await BranchModel.find({ restaurant: userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // ترتيب من الأحدث للأقدم (اختياري)

    return successresponse(res, {
        message: "Branches fetched successfully",
        page,
        totalPages: Math.ceil(totalBranches / limit),
        totalBranches,
        count: branches.length,
        branches
    });
});
export const deleteBranch = asyncHandelr(async (req, res, next) => {
    const branchId = req.params.id;
    const userId = req.user.id;

    const branch = await BranchModel.findOneAndDelete({
        _id: branchId,
        restaurant: userId // تأكيد أن الفرع يخص نفس المستخدم
    });

    if (!branch) {
        return next(new Error("❌ الفرع غير موجود أو لا تملك صلاحية حذفه", { cause: 404 }));
    }

    return successresponse(res, {
        message: "✅ تم حذف الفرع بنجاح",
        branch
    });
});
export const updateBranch = asyncHandelr(async (req, res, next) => {
    const branchId = req.params.id;
    const userId = req.user.id;

    const updateData = {
        branchCode: req.body.branchCode,
        branchName: req.body.branchName,
        country: req.body.country,
        city: req.body.city,
        phone: req.body.phone,
        address: req.body.address,
        manager: req.body.manager
    };

    const branch = await BranchModel.findOneAndUpdate(
        { _id: branchId, restaurant: userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!branch) {
        return next(new Error("❌ الفرع غير موجود أو لا تملك صلاحية تعديله", { cause: 404 }));
    }

    return successresponse(res, {
        message: "✅ تم تعديل بيانات الفرع بنجاح",
        branch
    });
});


export const confirmOTP = asyncHandelr(
    async (req, res, next) => {
        const { code, email } = req.body;


        const user = await dbservice.findOne({ model: Usermodel, filter: { email } })
        if (!user) {
            return next(new Error("Email does not exist tmm", { cause: 404 }));
        }


        if (user.blockUntil && Date.now() < new Date(user.blockUntil).getTime()) {
            const remainingTime = Math.ceil((new Date(user.blockUntil).getTime() - Date.now()) / 1000);
            return next(new Error(`Too many attempts. Please try again after ${remainingTime} seconds.`, { cause: 429 }));
        }


        if (user.isConfirmed) {
            return next(new Error("Email is already confirmed", { cause: 400 }));
        }


        if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
            return next(new Error("OTP has expired", { cause: 400 }));
        }


        const isValidOTP = comparehash({ planText: `${code}`, valuehash: user.emailOTP });
        if (!isValidOTP) {

            await dbservice.updateOne({ model: Usermodel, data: { $inc: { attemptCount: 1 } } })


            if (user.attemptCount + 1 >= 5) {
                const blockUntil = new Date(Date.now() + 2 * 60 * 1000);
                await Usermodel.updateOne({ email }, { blockUntil, attemptCount: 0 });
                return next(new Error("Too many attempts. You are temporarily blocked for 2 minutes.", { cause: 429 }));
            }

            return next(new Error("Invalid OTP. Please try again.", { cause: 400 }));
        }


        await Usermodel.updateOne(
            { email },
            {

                isConfirmed: true,
                $unset: { emailOTP: 0, otpExpiresAt: 0, attemptCount: 0, blockUntil: 0 },
            }
        );
        const access_Token = generatetoken({
            payload: { id: user._id },
            // signature: user.role === roletypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        });

        const refreshToken = generatetoken({
            payload: { id: user._id },
            // signature: user.role === roletypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: "365d"
        });

        return successresponse(res, "Email confirmed successfully", 200, { access_Token, refreshToken });
    }
);



  
