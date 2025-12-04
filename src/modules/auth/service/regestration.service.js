import { asyncHandelr } from "../../../utlis/response/error.response.js";
// import { Emailevent} from "../../../utlis/events/email.emit.js";
import *as dbservice from "../../../DB/dbservice.js"
import Usermodel, { providerTypes, roletypes } from "../../../DB/models/User.model.js";
import { comparehash, encryptData, generatehash } from "../../../utlis/security/hash.security.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import { OAuth2Client } from "google-auth-library";
import { generatetoken } from "../../../utlis/security/Token.security.js";
import cloud from "../../../utlis/multer/cloudinary.js";
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import { RestaurantModel } from "../../../DB/models/RestaurantSchema.model.js";
import { BranchModel } from "../../../DB/models/BranchopaSchema.model.js";
import { Emailevent } from "../../../utlis/events/email.emit.js";
import { MainGroupModel } from "../../../DB/models/mainGroupSchema.model.js";
import { SubGroupModel } from "../../../DB/models/subGroupSchema.model.js";
import { PermissionModel } from "../../../DB/models/permissionSchema.model.js";
import { AdminUserModel } from "../../../DB/models/adminUserSchema.model.js";
import { QuestionModel } from "../../../DB/models/question2Schema.model.js";
import { EvaluationModel } from "../../../DB/models/evaluationStatusSchema.model.js";
import evaluateModel from "../../../DB/models/evaluate.model.js";
import EvaluationResult from "../../../DB/models/answerSchema.model.js";
import { sendemail } from "../../../utlis/email/sendemail.js";
import { nanoid, customAlphabet } from "nanoid";

import { vervicaionemailtemplet } from "../../../utlis/temblete/vervication.email.js";
import { RoleModel } from "../../../DB/models/roleSchema.js";
import { TaskModel } from "../../../DB/models/taskSchema.js";
import { Taskkk } from "../../../DB/models/taskSchemaaa.js";
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

// export const registerRestaurant = asyncHandelr(async (req, res, next) => {
//     const { fullName, email, phone,  subdomain, password } = req.body;

//     // ✅ تحقق من تكرار subdomain و email
//     const checkuser = await dbservice.findOne({
//         model: Usermodel,
//         filter: {
//             $or: [{ subdomain }, { email }]
//         }
//     });

//     if (checkuser) {
//         if (checkuser.subdomain === subdomain) {
//             return next(new Error("subdomain already exists", { cause: 400 }));
//         }
//         if (checkuser.email === email) {
//             return next(new Error("email already exists", { cause: 400 }));
//         }
//     }

//     // ✅ تشفير كلمة المرور
//     const hashpassword = await generatehash({ planText: password });

//     // ✅ إنشاء المستخدم الجديد
//     const user = await dbservice.create({
//         model: Usermodel,
//         data: {
//             fullName,
//             password: hashpassword,
//             email,
//             phone,
          
//             subdomain
//         }
//     });

//     // ✅ بناء الرابط الديناميكي تلقائيًا
//     const restaurantLink = `https://morezk12.github.io/Restaurant-system/#/restaurant/${user.subdomain}`;

//     // ✅ دمج كل البيانات داخل كائن واحد لأن دالتك بتتعامل مع message فقط
//     const allData = {
//         message: "User created successfully",
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         // country: user.country,
//         subdomain: user.subdomain,
//         restaurantLink
//     };
//     Emailevent.emit("confirmemail", { email });
//     // ✅ رجع كل البيانات داخل message عشان دالتك
//     return successresponse(res, allData, 201);
// });
  



export const registerRestaurant = asyncHandelr(async (req, res, next) => {
    const { fullName, email, phone, subdomain, password } = req.body;

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

    // ================================
    // 🔥 إضافة إرسال OTP بالضبط زي signup 🔥
    // ================================
    try {
        if (email) {
            const otp = customAlphabet("0123456789", 6)();
            const html = vervicaionemailtemplet({ code: otp });

            const emailOTP = await generatehash({ planText: `${otp}` });
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await Usermodel.updateOne(
                { _id: user._id },
                { emailOTP, otpExpiresAt, attemptCount: 0 }
            );

            await sendemail({
                to: email,
                subject: "Confirm Email",
                text: "رمز التحقق الخاص بك",
                html,
            });

            console.log(`📩 OTP تم إرساله إلى البريد: ${email}`);
        }

    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.message);
        return next(new Error("فشل في إرسال رمز التحقق", { cause: 500 }));
    }
    // ================================

    // ✅ دمج كل البيانات داخل كائن واحد لأن دالتك بتتعامل مع message فقط
    const allData = {
        message: "User created successfully",
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        subdomain: user.subdomain,
        restaurantLink
    };

    Emailevent.emit("confirmemail", { email });

    // ✅ رجع كل البيانات داخل message
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



export const createMainGroup = asyncHandelr(async (req, res) => {
    const { name, status } = req.body;
    const userId = req.user.id;

    const group = await MainGroupModel.create({
        name,
        status,
        createdBy: userId
    });

    res.status(201).json({
        message: "✅ تم إنشاء المجموعة الرئيسية بنجاح",
        group
    });
});

export const createSubGroup = asyncHandelr(async (req, res) => {
    const { name, mainGroupId } = req.body;
    const userId = req.user.id;

    // تحقق أن المجموعة الرئيسية موجودة ومملوكة لنفس المستخدم
    const mainGroup = await MainGroupModel.findOne({
        _id: mainGroupId,
        createdBy: userId
    });

    if (!mainGroup) {
        res.status(404);
        throw new Error("❌ لا يمكنك إنشاء مجموعة فرعية بدون صلاحية على المجموعة الرئيسية");
    }

    const subGroup = await SubGroupModel.create({
        name,
        mainGroup: mainGroupId,
        createdBy: userId
    });

    res.status(201).json({
        message: "✅ تم إنشاء المجموعة الفرعية بنجاح",
        subGroup
    });
});

export const getMainGroupsForUser = asyncHandelr(async (req, res) => {
    const userId = req.user.id;

    const mainGroups = await MainGroupModel.find({ createdBy: userId })
        .select("name status createdAt");

    res.status(200).json({
        message: "✅ تم جلب المجموعات الرئيسية",
        count: mainGroups.length,
        mainGroups
    });
});

export const getMainGroupsWithSubGroups = asyncHandelr(async (req, res) => {
    const userId = req.user.id;

    // جلب كل المجموعات الرئيسية الخاصة بالمستخدم
    const mainGroups = await MainGroupModel.find({ createdBy: userId })
        .select("name status createdAt")
        .lean();

    // جلب كل المجموعات الفرعية الخاصة بالمستخدم
    const allSubGroups = await SubGroupModel.find({ createdBy: userId })
        .select("name mainGroup")
        .lean();

    // ربط المجموعات الفرعية مع كل مجموعة رئيسية
    const result = mainGroups.map(mainGroup => {
        const subGroups = allSubGroups.filter(
            sub => sub.mainGroup.toString() === mainGroup._id.toString()
        );

        return {
            _id: mainGroup._id,
            name: mainGroup.name,
            status: mainGroup.status,
            subGroups,
            subGroupCount: subGroups.length
        };
    });

    res.status(200).json({
        message: "✅ تم جلب المجموعات الرئيسية مع المجموعات الفرعية",
        count: result.length,
        totalSubGroups: allSubGroups.length,
        data: result
    });
});

export const deleteMainGroup = asyncHandelr(async (req, res) => {
    const mainGroupId = req.params.id;
    const userId = req.user.id;

    const mainGroup = await MainGroupModel.findOneAndDelete({
        _id: mainGroupId,
        createdBy: userId
    });

    if (!mainGroup) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على المجموعة أو لا تملك صلاحية الحذف");
    }

    // حذف جميع المجموعات الفرعية المرتبطة
    await SubGroupModel.deleteMany({ mainGroup: mainGroupId });

    res.status(200).json({
        message: "✅ تم حذف المجموعة الرئيسية وجميع المجموعات الفرعية التابعة لها"
    });
});


export const deleteSubGroup = asyncHandelr(async (req, res) => {
    const subGroupId = req.params.id;
    const userId = req.user.id;

    const subGroup = await SubGroupModel.findOneAndDelete({
        _id: subGroupId,
        createdBy: userId
    });

    if (!subGroup) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على المجموعة الفرعية أو لا تملك صلاحية الحذف");
    }

    res.status(200).json({
        message: "✅ تم حذف المجموعة الفرعية بنجاح"
    });
});


export const updateMainGroup = asyncHandelr(async (req, res) => {
    const mainGroupId = req.params.id;
    const userId = req.user.id;
    const { name, status } = req.body;

    const updated = await MainGroupModel.findOneAndUpdate(
        { _id: mainGroupId, createdBy: userId },
        { name, status },
        { new: true, runValidators: true }
    );

    if (!updated) {
        res.status(404);
        throw new Error("❌ لا تملك صلاحية التعديل أو المجموعة غير موجودة");
    }

    res.status(200).json({
        message: "✅ تم تعديل المجموعة الرئيسية بنجاح",
        updated
    });
});

export const updateSubGroup = asyncHandelr(async (req, res) => {
    const subGroupId = req.params.id;
    const userId = req.user.id;
    const { name, mainGroupId } = req.body;

    // تأكد أن المستخدم يملك المجموعة الرئيسية الجديدة (إن تم تعديلها)
    if (mainGroupId) {
        const mainGroup = await MainGroupModel.findOne({
            _id: mainGroupId,
            createdBy: userId
        });
        if (!mainGroup) {
            res.status(403);
            throw new Error("❌ لا تملك صلاحية ربط بهذه المجموعة الرئيسية");
        }
    }

    const updated = await SubGroupModel.findOneAndUpdate(
        { _id: subGroupId, createdBy: userId },
        { name, mainGroup: mainGroupId },
        { new: true, runValidators: true }
    );

    if (!updated) {
        res.status(404);
        throw new Error("❌ لا تملك صلاحية التعديل أو المجموعة غير موجودة");
    }

    res.status(200).json({
        message: "✅ تم تعديل المجموعة الفرعية بنجاح",
        updated
    });
});


export const getMySubGroups = asyncHandelr(async (req, res) => {
    const userId = req.user.id;

    const subGroups = await SubGroupModel.find({ createdBy: userId })
        .populate("mainGroup", "name") // يمكنك تعديل الحقول التي تود جلبها من المجموعة الرئيسية
        .sort({ createdAt: -1 }); // ترتيب تنازلي حسب تاريخ الإنشاء

    res.status(200).json({
        message: "✅ تم جلب المجموعات الفرعية الخاصة بك بنجاح",
        count: subGroups.length,
        subGroups,
    });
});



export const createPermissions = asyncHandelr(async (req, res) => {
    // const userId = req.user.id;
    const { name, description } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("❌ يجب إدخال اسم الصلاحية");
    }

    const existing = await PermissionModel.findOne({ name: name.toLowerCase().trim() });

    if (existing) {
        res.status(400);
        throw new Error("❌ هذه الصلاحية موجودة بالفعل");
    }

    const created = await PermissionModel.create({
        name: name.toLowerCase().trim(),
        description,
        // createdBy: userId
    });

    res.status(201).json({
        message: "✅ تم إنشاء الصلاحية",
        permission: created
    });
});



export const createRole = asyncHandelr(async (req, res) => {
    const { name, permissions, description } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("❌ يجب إدخال اسم الدور");
    }

    // تأكد أن الصلاحيات موجودة
    const validPermissions = await PermissionModel.find({
        _id: { $in: permissions }
    });

    if (validPermissions.length !== permissions.length) {
        res.status(400);
        throw new Error("❌ بعض الصلاحيات غير موجودة");
    }

    const role = await RoleModel.create({
        name: name.toLowerCase().trim(),
        permissions,
        description
    });

    res.status(201).json({
        message: "✅ تم إنشاء الدور",
        role
    });
});

// controllers/role.controller.js
export const getAllRoles = asyncHandelr(async (req, res) => {
    // جلب كل الـ Roles و populate للـ permissions
    const roles = await RoleModel.find()
        .populate({
            path: "permissions",  // الاسم زي ما مكتوب في schema
            select: "name description -_id" // تجيب الاسم والوصف فقط من كل صلاحية
        });

    res.status(200).json({
        message: "✅ تم جلب كل الأدوار مع الصلاحيات",
        roles
    });
});




export const getAllPermissions = asyncHandelr(async (req, res) => {
    // const userId = req.user.id;

    const permissions = await PermissionModel.find();

    res.status(200).json({
        message: "✅ الصلاحيات الخاصة بك",
        count: permissions.length,
        permissions
    });
});

// controllers/permission.controller.js

export const deletePermission = asyncHandelr(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const permission = await PermissionModel.findOneAndDelete({
        _id: id,
        createdBy: userId
    });

    if (!permission) {
        res.status(404);
        throw new Error("❌ الصلاحية غير موجودة أو ليس لديك صلاحية لحذفها");
    }

    res.status(200).json({
        message: "✅ تم حذف الصلاحية بنجاح",
        deletedId: permission._id
    });
});

export const updatePermission = asyncHandelr(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await PermissionModel.findOneAndUpdate(
        { _id: id, createdBy: userId },
        {
            ...(name && { name: name.toLowerCase().trim() }),
            ...(description && { description })
        },
        { new: true, runValidators: true }
    );

    if (!updated) {
        res.status(404);
        throw new Error("❌ الصلاحية غير موجودة أو ليس لديك صلاحية لتعديلها");
    }

    res.status(200).json({
        message: "✅ تم تعديل الصلاحية بنجاح",
        permission: updated
    });
});

// export const createAdminUser = asyncHandelr(async (req, res) => {
//     const createdBy = req.user.id; // صاحب المطعم من التوكن

//     const {
//         name,
//         phone,
//         password,
//         branch,
//         mainGroup,
//         subGroup,
//         permissions
//     } = req.body;

//     if (!name || !phone || !password || !branch || !mainGroup || !subGroup || !permissions) {
//         res.status(400);
//         throw new Error("❌ كل الحقول مطلوبة");
//     }

//     // تحقق إن الهاتف مش مكرر
//     const exists = await AdminUserModel.findOne({ phone });
//     if (exists) {
//         res.status(400);
//         throw new Error("❌ هذا الرقم مستخدم بالفعل");
//     }

//     const admin = await AdminUserModel.create({
//         name,
//         phone,
//         password,
//         branch,
//         mainGroup,
//         subGroup,
//         permissions,
//         createdBy
//     });

//     res.status(201).json({
//         message: "✅ تم إنشاء الأدمن بنجاح",
//         admin: {
//             _id: admin._id,
//             name: admin.name,
//             phone: admin.phone,
//             branch: admin.branch,
//             mainGroup: admin.mainGroup,
//             subGroup: admin.subGroup,
//             permissions: admin.permissions
//         }
//     });
// });




// export const createAdminUser = asyncHandelr(async (req, res) => {
//     const createdBy = req.user.id;
//     const {
//         name, phone, email,password, branch,
//         mainGroup, subGroup, permissions
//     } = req.body;

//     if (
//         !name || !phone || !password ||
//         !email ||
//         !Array.isArray(branch) ||
//         !Array.isArray(mainGroup) ||
//         !Array.isArray(subGroup) ||
//         !Array.isArray(permissions)
//     ) {
//         res.status(400);
//         throw new Error("❌ جميع الحقول مطلوبة ويجب أن تكون المجموعات والفروع والصلاحيات في صورة Array");
//     }




//     const exists = await AdminUserModel.findOne({ email });
//     if (exists) {
//         res.status(400);
//         throw new Error("❌ هذا الرقم مستخدم بالفعل");
//     }

//     // ✅ رفع الصورة من req.files.image[0]
//     let uploadedImage = null;
//     const imageFile = req.files?.image?.[0];
//     if (imageFile) {
//         const uploaded = await cloud.uploader.upload(imageFile.path, {
//             folder: `adminUsers/${createdBy}`
//         });
//         uploadedImage = {
//             secure_url: uploaded.secure_url,
//             public_id: uploaded.public_id
//         };
//     }

//     const admin = await AdminUserModel.create({
//         name,
//         phone,
//         email,
//         password,
//         branch,
//         mainGroup,
//         subGroup,
//         permissions,
//         profileImage: uploadedImage,
//         createdBy
//     });

//     res.status(201).json({
//         message: "✅ تم إنشاء الأدمن بنجاح",
//         admin: {
//             _id: admin._id,
//             name: admin.name,
//             phone: admin.phone,
//             branch: admin.branch,
//             email: admin.email,
//             profileImage: admin.profileImage,
//             permissions: admin.permissions
//         }
//     });
// });




// جدول المستخدمين العاديين

export const createAdminUser = asyncHandelr(async (req, res) => {
    const createdBy = req.user.id;
    let {
        name,
        phone,
        email,
        password,
        branch,
        mainGroup,
        subGroup,
        roleId
    } = req.body;

    // تحويل strings إلى array لو لزم
    try {
        branch = typeof branch === "string" ? JSON.parse(branch) : branch;
        mainGroup = typeof mainGroup === "string" ? JSON.parse(mainGroup) : mainGroup;
        subGroup = typeof subGroup === "string" ? JSON.parse(subGroup) : subGroup;
    } catch (error) {
        res.status(400);
        throw new Error("❌ فشل تحويل الفروع والمجموعات من JSON إلى Array");
    }

    // 🔥 اطبع كل البيانات
    console.log("🚀 Incoming Data:", { name, phone, email, password, branch, mainGroup, subGroup, roleId, files: req.files });

    // التحقق من صحة البيانات
    if (!name || !phone || !password || !email || !Array.isArray(branch) || !Array.isArray(mainGroup) || !Array.isArray(subGroup) || !roleId) {
        res.status(400);
        throw new Error("❌ جميع الحقول مطلوبة ويجب أن تكون المجموعات والفروع في صورة Array ويجب إدخال roleId");
    }

    // تحقق من وجود البريد في جدول الأدمن
    const existsAdmin = await AdminUserModel.findOne({ email });
    if (existsAdmin) {
        res.status(400);
        throw new Error("❌ هذا البريد مستخدم بالفعل");
    }

    // تحقق من وجود الدور
    const role = await RoleModel.findById(roleId);
    if (!role) {
        res.status(404);
        throw new Error("❌ هذا الدور غير موجود");
    }

    // رفع الصورة إذا موجودة
    let uploadedImage = null;
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const uploaded = await cloud.uploader.upload(imageFile.path, {
            folder: `adminUsers/${createdBy}`
        });
        uploadedImage = {
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id
        };
    }

    // تشفير كلمة المرور قبل التخزين في جدول المستخدمين
    const hashedPassword = await generatehash({ planText: password });

    // إنشاء المستخدم في جدول User (لتسجيل الدخول العادي)
    const user = await Usermodel.create({
        fullName: name,
        email,
        password: hashedPassword,
        phone
    });

    // إنشاء الأدمن
    const admin = await AdminUserModel.create({
        name,
        phone,
        email,
        password, // لو عايز تشفير هنا كمان ممكن تستخدم hashedPassword بدل password
        branch,
        mainGroup,
        subGroup,
        role: roleId,
        profileImage: uploadedImage,
        userId: user._id,
        createdBy
    });

    console.log("✅ Admin Created:", admin);
    console.log("✅ User Created for login:", user);

    res.status(201).json({
        message: "✅ تم إنشاء الأدمن وتخزينه كمستخدم لتسجيل الدخول بنجاح",
        admin: {
            _id: admin._id,
            name: admin.name,
            phone: admin.phone,
            email: admin.email,
            branch: admin.branch,
            profileImage: admin.profileImage,
            role: {
                _id: role._id,
                name: role.name
            }
        }
    });
});






export const createTaskUser = asyncHandelr(async (req, res) => {
    const createdBy = req.user.id;
    const { title, note } = req.body;

    if (!title) {
        res.status(400);
        throw new Error("❌ العنوان مطلوب");
    }

    let uploadedImage = null;

    // لاحظ هنا 👇
    const imageFile = req.files?.image?.[0];

    if (imageFile) {
        const uploaded = await cloud.uploader.upload(imageFile.path, {
            folder: `tasks/${createdBy}`
        });

        uploadedImage = {
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id
        };
    }

    const task = await Taskkk.create({
        title,
        note,
        profileImage: uploadedImage,
        createdBy
    });

    res.status(201).json({
        message: "✅ تم إنشاء التاسك بنجاح",
        task
    });
});




export const getTasksByUser = asyncHandelr(async (req, res) => {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("❌ userId غير صالح");
    }

    const tasks = await Taskkk.find({ createdBy: userId })
        .sort({ createdAt: -1 }); // الأحدث أولاً

    res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
    });
});



export const getMyTasks = asyncHandelr(async (req, res) => {
    const userEmail = req.user.email; // جاي من التوكن

    // جلب الـ userId بناءً على الايميل
    const user = await Usermodel.findOne({ email: userEmail });
    if (!user) {
        res.status(404);
        throw new Error("❌ المستخدم غير موجود");
    }

    // جلب المهام المخصصة لهذا المستخدم
    const tasks = await TaskModel.find({ assignedTo: user._id })
        .populate("assignedTo", "fullName email phone") // جلب بيانات الموظف
        .populate("createdBy", "fullName email")       // جلب بيانات الشخص الذي أضاف المهمة
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
    });
});


export const getAllAdminUsers = asyncHandelr(async (req, res) => {
    const createdBy = req.user.id;

    const admins = await AdminUserModel.find({ createdBy })
        .populate("branch", "branchName")
        .populate("mainGroup", "name")
        .populate("subGroup", "name")
        .populate("permissions", "name description")
        .populate("userId", "fullName email phone"); // ← هنا بنجيب بياناته من users

    res.status(200).json({
        message: "✅ الأدمنات التابعين لك",
        count: admins.length,
        admins
    });
});










export const getSubGroupsByMainGroup = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id;
    const { mainGroupId } = req.params;

    if (!mainGroupId) {
        return next(new Error("❌ يجب إرسال معرف المجموعة الرئيسية", { cause: 400 }));
    }

    // تأكد إن المجموعة الرئيسية فعلاً ملك المستخدم
    const mainGroup = await MainGroupModel.findOne({ _id: mainGroupId, createdBy: userId });

    if (!mainGroup) {
        return next(new Error("❌ لا تملك صلاحية الوصول لهذه المجموعة الرئيسية أو غير موجودة", { cause: 404 }));
    }

    // جلب المجموعات الفرعية التابعة لها
    const subGroups = await SubGroupModel.find({ mainGroup: mainGroupId, createdBy: userId })
        .select("name createdAt")
        .lean();

    res.status(200).json({
        message: "✅ تم جلب المجموعات الفرعية الخاصة بهذه المجموعة الرئيسية",
        count: subGroups.length,
        mainGroup: {
            _id: mainGroup._id,
            name: mainGroup.name
        },
        subGroups
    });
});


export const deleteAdminUser = asyncHandelr(async (req, res) => {
    const adminId = req.params.id;
    const userId = req.user.id; // صاحب المطعم

    const admin = await AdminUserModel.findOneAndDelete({
        _id: adminId,
        createdBy: userId
    });

    if (!admin) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على الأدمن أو ليس لديك صلاحية الحذف");
    }

    res.status(200).json({
        message: "✅ تم حذف الأدمن بنجاح"
    });
});

export const updateAdminUser = asyncHandelr(async (req, res) => {
    const adminId = req.params.id;
    const userId = req.user.id;

    const {
        name, phone, email, password,
        branch, mainGroup, subGroup, permissions
    } = req.body;

    const oldAdmin = await AdminUserModel.findOne({ _id: adminId, createdBy: userId });
    if (!oldAdmin) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على الأدمن أو ليس لديك صلاحية التعديل");
    }

    // دمج الأريهات
    const mergeArray = (oldArray = [], newArray = []) => {
        if (!Array.isArray(newArray)) return oldArray;
        const filtered = oldArray.filter(item => newArray.includes(item));
        const added = newArray.filter(item => !filtered.includes(item));
        return [...filtered, ...added];
    };

    const updatedData = {
        name: name || oldAdmin.name,
        phone: phone || oldAdmin.phone,
        email: email || oldAdmin.email,
        password: password || oldAdmin.password,
        branch: mergeArray(oldAdmin.branch, branch),
        mainGroup: mergeArray(oldAdmin.mainGroup, mainGroup),
        subGroup: mergeArray(oldAdmin.subGroup, subGroup),
        permissions: mergeArray(oldAdmin.permissions, permissions)
    };

    // رفع صورة جديدة إن وجدت
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const uploaded = await cloud.uploader.upload(imageFile.path, {
            folder: `adminUsers/${userId}`
        });
        updatedData.profileImage = {
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id
        };
    }

    const updatedAdmin = await AdminUserModel.findOneAndUpdate(
        { _id: adminId, createdBy: userId },
        updatedData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        message: "✅ تم تحديث بيانات الأدمن بنجاح",
        admin: updatedAdmin
    });
});

export const createQuestion = asyncHandelr(async (req, res) => {
    const userId = req.user.id;
    const { questions, mainGroup, subGroup, isActive } = req.body;

    if (!mainGroup || !subGroup) {
        res.status(400);
        throw new Error("❌ يجب تحديد المجموعة الرئيسية والفرعية");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400);
        throw new Error("❌ يجب إرسال مصفوفة من الأسئلة");
    }

    const formattedQuestions = questions.map(q => {
        if (!q.questionText?.ar || !q.questionText?.en || !q.evaluation) {
            throw new Error("❌ كل سؤال يجب أن يحتوي على questionText و evaluation");
        }

        // ✅ الحل هنا باستخدام new
        return {
            questionText: q.questionText,
            evaluation: new mongoose.Types.ObjectId(q.evaluation)
        };
    });

    const created = await QuestionModel.create({
        questions: formattedQuestions,
        mainGroup,
        subGroup,
        isActive: isActive ?? true,
        createdBy: userId
    });

    res.status(201).json({
        message: "✅ تم إنشاء الأسئلة في مستند واحد بنجاح",
        data: created
    });
});


export const getQuestionsByMainGroups = asyncHandelr(async (req, res) => {
    const userId = req.user.id;

    // جلب كل المجموعات الرئيسية الخاصة بالمستخدم
    const mainGroups = await MainGroupModel.find({ createdBy: userId }).lean();

    // جلب كل المجموعات الفرعية الخاصة بالمستخدم
    const subGroups = await SubGroupModel.find({ createdBy: userId }).lean();

    // ✅ جلب الأسئلة ومعاها التقييم داخل كل سؤال في المصفوفة
    const questions = await QuestionModel.find({ createdBy: userId })
        .populate("questions.evaluation") // ✅ تم التعديل هنا فقط
        .lean();

    const data = mainGroups.map(main => {
        // جلب المجموعات الفرعية التابعة للمجموعة الرئيسية الحالية
        const relatedSubGroups = subGroups
            .filter(sub => sub.mainGroup.toString() === main._id.toString())
            .map(sub => {
                // جلب الأسئلة المرتبطة بهذه المجموعة الفرعية
                const relatedQuestions = questions.filter(q =>
                    q.subGroup.toString() === sub._id.toString()
                );

                return {
                    _id: sub._id,
                    name: sub.name,
                    questions: relatedQuestions
                };
            });

        // حساب عدد الأسئلة في كل المجموعات الفرعية
        const totalQuestions = relatedSubGroups.reduce((acc, sub) => acc + sub.questions.length, 0);

        if (totalQuestions > 0) {
            return {
                _id: main._id,
                name: main.name,
                subGroups: relatedSubGroups
            };
        }

        return null; // تجاهل المجموعات الرئيسية التي لا تحتوي على أي أسئلة
    }).filter(Boolean); // إزالة القيم الفارغة

    res.status(200).json({
        message: "✅ تم جلب المجموعات الرئيسية والفرعية مع الأسئلة",
        count: data.length,
        data
    });
});

export const createEvaluation = asyncHandelr(async (req, res) => {
    const { title, statuses } = req.body;
    const createdBy = req.user._id;

    if (!title || !Array.isArray(statuses) || statuses.length === 0) {
        res.status(400);
        throw new Error("❌ العنوان مطلوب ويجب إدخال حالة تقييم واحدة على الأقل");
    }

    const evaluation = await EvaluationModel.create({
        title,
        statuses,
        createdBy
    });

    res.status(201).json({
        message: "✅ تم إنشاء التقييم بنجاح",
        evaluation
    });
});


// ✅ GET: جلب جميع التقييمات الخاصة بالمستخدم
export const getEvaluations = asyncHandelr(async (req, res) => {
    const createdBy = req.user._id;

    const evaluations = await EvaluationModel.find({ createdBy });

    res.status(200).json({
        message: "✅ تم جلب التقييمات",
        count: evaluations.length,
        data: evaluations
    });
});


export const deleteSingleQuestion = asyncHandelr(async (req, res) => {
    const { mainId, questionId } = req.params;

    const updated = await QuestionModel.findByIdAndUpdate(
        mainId,
        {
            $pull: {
                questions: { _id: questionId }
            }
        },
        { new: true }
    );

    if (!updated) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على السؤال أو المستند");
    }

    res.status(200).json({
        message: "✅ تم حذف السؤال بنجاح",
        data: updated
    });
});


export const updateSingleQuestion = asyncHandelr(async (req, res) => {
    const { mainId, questionId } = req.params; // mainId هو ID المستند الرئيسي
    const { questionText, evaluation } = req.body;

    const question = await QuestionModel.findOneAndUpdate(
        {
            _id: mainId,
            "questions._id": questionId
        },
        {
            $set: {
                "questions.$.questionText": questionText,
                "questions.$.evaluation": new mongoose.Types.ObjectId(evaluation)
            }
        },
        { new: true }
    );

    if (!question) {
        res.status(404);
        throw new Error("❌ لم يتم العثور على السؤال أو المستند");
    }

    res.status(200).json({
        message: "✅ تم تحديث السؤال بنجاح",
        data: question
    });
});


export const createMode = async (req, res) => {
    try {
        const { managerName, subGroups, locationId } = req.body;
        const userId = req.user?._id;
        if (!managerName || !locationId) {
            return res.status(400).json({ message: "البيانات ناقصة" });
        }

        const newMode = new evaluateModel({
            managerName,
            subGroups,
            createdBy: userId,
            locationId,
        });

        await newMode.save();

        res.status(201).json({
            success: true,
            message: "تم إنشاء المود بنجاح",
            data: newMode,
        });
    } catch (error) {
        console.error("❌ خطأ في إنشاء المود:", error);
        res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};


export const getMyEvaluations = async (req, res) => {
    try {
        const userId = req.user.id;

        const evaluations = await evaluateModel.find({ createdBy: userId })
            .populate({
                path: "locationId",
                select: "branchName",
                model: BranchModel
            })
            .populate({
                path: "createdBy",
                select: "fullName",
                model: Usermodel
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "تم جلب كل التقييمات بنجاح",
            count: evaluations.length,
            data: evaluations.map(e => ({
                managerName: e.managerName,
                date: e.createdAt,
                location: e.locationId?.branchName || "غير محدد",
                createdBy: e.createdBy?.fullName || "غير معروف"
            }))
        });
    } catch (error) {
        console.error("❌ خطأ أثناء جلب التقييمات:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
};

export const getModeSubGroupsWithQuestions = async (req, res) => {
    try {
        const { modeId } = req.params;
        if (!modeId) {
            return res.status(400).json({ success: false, message: "يجب إرسال معرف المود" });
        }

        const mode = await evaluateModel.findById(modeId)
            .populate({
                path: "locationId",
                select: "branchName _id",
                model: BranchModel
            })
            .populate({
                path: "createdBy",
                select: "fullName",
                model: Usermodel
            })
            .lean();

        if (!mode) {
            return res.status(404).json({ success: false, message: "المود غير موجود" });
        }

        const subGroups = await SubGroupModel.find({ _id: { $in: mode.subGroups } }).lean();

        const subGroupData = await Promise.all(subGroups.map(async (subGroup) => {
            const questionDocs = await QuestionModel.find({ subGroup: subGroup._id }).lean();
            const allQuestions = questionDocs.flatMap(doc => doc.questions || []);
            const evaluationIds = allQuestions.map(q => q.evaluation);

            const evaluationsMap = await EvaluationModel.find({ _id: { $in: evaluationIds } })
                .lean()
                .then(evals => Object.fromEntries(evals.map(ev => [ev._id.toString(), ev])));

            const filteredQuestions = allQuestions
                .filter(q => evaluationsMap[q.evaluation?.toString()])
                .map(q => ({
                    questionText: q.questionText,
                    evaluation: q.evaluation,
                    _id: q._id
                }));

            return {
                _id: subGroup._id,
                name: subGroup.name,
                questions: filteredQuestions
            };
        }));

        res.status(200).json({
            success: true,
            message: "✅ تم جلب البيانات بنجاح",
            data: [{
                managerName: mode.managerName,
                date: mode.createdAt,
                location: mode.locationId?.branchName || "غير محدد",
                _id: mode.locationId?._id || "غير محدد",
                createdBy: mode.createdBy?.fullName || "غير معروف",
                subGroups: subGroupData
            }]
        });

    } catch (error) {
        console.error("❌ خطأ أثناء جلب المجموعات والأسئلة:", error);
        res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};


export const createEvaluationResult = async (req, res) => {
    try {
        const { modeId, answers, percentage, locationId } = req.body;
        const userId = req.user?._id;

        const updatedAnswers = answers.map(answer => ({
            ...answer,
            createdBy: userId,
        }));

        const newResult = await EvaluationResult.create({
            modeId,
            locationId,
            answers: updatedAnswers,
            createdBy: userId,
            percentage, // 🔥 النسبة مضافة هنا فقط لمرة واحدة
        });

        res.status(201).json({
            success: true,
            message: "تم إنشاء نتيجة التقييم بنجاح",
            data: newResult,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إنشاء التقييم",
            error: err.message,
        });
    }
};



export const getEvaluationResultsByMode = async (req, res) => {
    try {
        const userId = req.user.id;

        const results = await EvaluationResult.find({ createdBy: userId })
            .populate("modeId", "title managerName percentage")
            .populate("answers.subGroupId", "name")
            .populate("answers.createdBy", "fullName")
            .populate("locationId", "branchName")
            .lean();

        const allQuestionIds = results.flatMap(result =>
            result.answers.map(ans => ans.questionId)
        );

        const allQuestionDocs = await QuestionModel.find({
            "questions._id": { $in: allQuestionIds }
        }).lean();

        const questionMap = {};
        for (const doc of allQuestionDocs) {
            for (const q of doc.questions) {
                questionMap[q._id.toString()] = q.questionText;
            }
        }

        const formatDate = (date) => {
            const d = new Date(date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
        };

        const responseData = results.map(result => ({
            _id: result._id,
            modeTitle: result.modeId?.title,
            managerName: result.modeId?.managerName,
            branchName: result.locationId?.branchName || "غير محدد",
            percentage: result.percentage,
            createdAt: formatDate(result.createdAt),
            answers: result.answers.map(ans => ({
                question: questionMap[ans.questionId?.toString()] || "❌ غير متوفر",
                subGroup: ans.subGroupId?.name || "❌ غير معروف",
                answer: ans.answer,
                answeredBy: ans.createdBy?.fullName || "غير معروف"
            }))
        }));

        res.status(200).json({
            success: true,
            message: "✅ تم جلب التقييمات الخاصة بك بالتفصيل بنجاح",
            count: results.length,
            data: responseData
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({
            success: false,
            message: "❌ حدث خطأ أثناء جلب التقييمات",
            error: err.message
        });
    }
};


export const getMyEvaluationResults = async (req, res) => {
    try {
        const userId = req.user.id;

        const evaluations = await EvaluationResult.find({ createdBy: userId })
            .populate({
                path: "locationId",
                select: "branchName",
                model: "Location" // ✅ تأكد من الاسم
            })
            .populate({
                path: "createdBy",
                select: "fullName",
                model: "User" // ✅ تأكد من الاسم
            })
            .sort({ createdAt: -1 });

        console.log("✅ Evaluations:", evaluations);

        res.status(200).json({
            success: true,
            message: "تم جلب التقييمات الخاصة بك بنجاح",
            count: evaluations.length,
            data: evaluations.map(e => ({
                fullName: e.createdBy?.fullName || "غير معروف",
                percentage: e.percentage,
                date: e.createdAt,
                location: e.locationId?.branchName || "غير محدد",
            }))
        });
    } catch (error) {
        console.error("❌ خطأ أثناء جلب نتائج التقييم:", error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر"
        });
    }
};



// إنشاء مهمة جديدة
export const createTask = asyncHandelr(async (req, res, next) => {
    const { assignedTo, message, fromTime, toTime } = req.body;

    // التحقق من البيانات المطلوبة
    if (!assignedTo || !message || !fromTime || !toTime) {
        return res.status(400).json({
            success: false,
            message: "جميع الحقول مطلوبة: assignedTo, message, fromTime, toTime"
        });
    }

    // إنشاء المهمة
    const task = await TaskModel.create({
        assignedTo,
        message,
        fromTime: new Date(fromTime),
        toTime: new Date(toTime),
        createdBy: req.user.id
    });

    return res.status(201).json({
        success: true,
        message: "تم إنشاء المهمة بنجاح",
        data: task
    });
});
