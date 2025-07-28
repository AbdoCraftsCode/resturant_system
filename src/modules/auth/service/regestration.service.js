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




export const createAdminUser = asyncHandelr(async (req, res) => {
    const createdBy = req.user.id;
    const {
        name, phone, email,password, branch,
        mainGroup, subGroup, permissions
    } = req.body;

    if (
        !name || !phone || !password ||
        !email ||
        !Array.isArray(branch) ||
        !Array.isArray(mainGroup) ||
        !Array.isArray(subGroup) ||
        !Array.isArray(permissions)
    ) {
        res.status(400);
        throw new Error("❌ جميع الحقول مطلوبة ويجب أن تكون المجموعات والفروع والصلاحيات في صورة Array");
    }




    const exists = await AdminUserModel.findOne({ email });
    if (exists) {
        res.status(400);
        throw new Error("❌ هذا الرقم مستخدم بالفعل");
    }

    // ✅ رفع الصورة من req.files.image[0]
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

    const admin = await AdminUserModel.create({
        name,
        phone,
        email,
        password,
        branch,
        mainGroup,
        subGroup,
        permissions,
        profileImage: uploadedImage,
        createdBy
    });

    res.status(201).json({
        message: "✅ تم إنشاء الأدمن بنجاح",
        admin: {
            _id: admin._id,
            name: admin.name,
            phone: admin.phone,
            branch: admin.branch,
            email: admin.email,
            profileImage: admin.profileImage,
            permissions: admin.permissions
        }
    });
});






export const getAllAdminUsers = asyncHandelr(async (req, res) => {
    const createdBy = req.user.id;

    const admins = await AdminUserModel.find({ createdBy })
        .populate("branch", "branchName")        // فك اسم الفرع
        .populate("mainGroup", "name")           // فك اسم المجموعة الرئيسية
        .populate("subGroup", "name")            // فك اسم المجموعة الفرعية
        .populate("permissions", "name description"); // فك الصلاحيات

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

