import { CategoryModel } from "../../../DB/models/Category.model.js";

import cloud from "../../../utlis/multer/cloudinary.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";

import * as dbservice from "../../../DB/dbservice.js"
import { DepartmentModel } from "../../../DB/models/Department3.model.js";
import Usermodel from "../../../DB/models/User.model.js";
import { SocialMediaModel } from "../../../DB/models/socialmidia.model.js";

export const createCategory = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user); 
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create categories.", { cause: 403 }));
    }


    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `categories/${req.user._id}` });

    const category = await CategoryModel.create({
        name: {
            en: req.body.name_en,
            ar: req.body.name_ar
        },
        image: { secure_url, public_id },
        updatedBy: req.user._id
    });

    return successresponse(res, "Category created successfully!", 201, );
});



// export const sendNotificationToUser = asyncHandelr(async (req, res, next) => {
//     console.log("User Data:", req.user);
//     if (!["Admin", "Owner"].includes(req.user.role)) {
//         return next(new Error("Unauthorized! Only Admins or Owners can send notifications.", { cause: 403 }));
//     }

//     if (!req.body.email) {
//         return next(new Error("❌ يجب توفير البريد الإلكتروني!", { cause: 400 }));
//     }

//     let secure_url = null;
//     let public_id = null;

//     // تأكد أن الصورة تم رفعها
//     if (req.file) {
//         const uploadResult = await cloud.uploader.upload(req.file.path, { folder: `orderdetails/${req.user._id}` });
//         secure_url = uploadResult.secure_url;
//         public_id = uploadResult.public_id;
//     } else {
//         return next(new Error("❌ يجب رفع صورة!", { cause: 400 }));
//     }

//     const user = await Usermodel.findOne({ email: req.body.email });

//     if (!user) {
//         return next(new Error("❌ المستخدم غير موجود!", { cause: 404 }));
//     }

//     // التأكد من وجود المدخلات المطلوبة
//     if (!req.body.orderStatus_en || !req.body.orderStatus_ar) {
//         return next(new Error("❌ يجب توفير حالة الطلب باللغة العربية والإنجليزية!", { cause: 400 }));
//     }

//     // إضافة البيانات إلى الـ Array مباشرةً بدون مشاكل
//     const newNotification = {
//         orderDate: req.body.orderDate,
//         orderDetails: {
//             en: req.body.orderDetails_en,
//             ar: req.body.orderDetails_ar
//         },
//         orderStatus: {
//             en: req.body.orderStatus_en,
//             ar: req.body.orderStatus_ar
//         },
//         orderPaid: req.body.orderPaid,
       
//         remainingAmount: req.body.remainingAmount,
//         orderNumber: req.body.orderNumber,
//         ordervalue: req.body.ordervalue,
//         image: { secure_url, public_id },
//         updatedBy: req.user._id
//     };

//     // دفع البيانات الجديدة داخل المصفوفة مباشرةً
//     user.notifications.push(newNotification);

//     // حفظ التحديثات
//     await user.save();

//     return successresponse(res, "✅ تم إرسال الإشعار بنجاح!", 201);
// });



export const sendNotificationToUser = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can send notifications.", { cause: 403 }));
    }

    if (!req.body.email) {
        return next(new Error("❌ يجب توفير البريد الإلكتروني!", { cause: 400 }));
    }

    let secure_url = null;
    let public_id = null;

    // ✅ جعل رفع الصورة اختياري
    if (req.file) {
        const uploadResult = await cloud.uploader.upload(req.file.path, { folder: `orderdetails/${req.user._id}` });
        secure_url = uploadResult.secure_url;
        public_id = uploadResult.public_id;
    }
    // ❌ لا توجد صورة مرفوعة، لكن لن نرجع خطأ الآن

    const user = await Usermodel.findOne({ email: req.body.email });

    if (!user) {
        return next(new Error("❌ المستخدم غير موجود!", { cause: 404 }));
    }

    // التأكد من وجود المدخلات المطلوبة
    if (!req.body.orderStatus_en || !req.body.orderStatus_ar) {
        return next(new Error("❌ يجب توفير حالة الطلب باللغة العربية والإنجليزية!", { cause: 400 }));
    }

    const newNotification = {
        orderDate: req.body.orderDate,
        orderDetails: {
            en: req.body.orderDetails_en,
            ar: req.body.orderDetails_ar
        },
        orderStatus: {
            en: req.body.orderStatus_en,
            ar: req.body.orderStatus_ar
        },
        orderPaid: req.body.orderPaid,
        remainingAmount: req.body.remainingAmount,
        orderNumber: req.body.orderNumber,
        ordervalue: req.body.ordervalue,
        image: { secure_url, public_id }, // لو مفيش صورة هتبقى null، مش مشكلة
        updatedBy: req.user._id
    };

    user.notifications.push(newNotification);
    await user.save();

    return successresponse(res, "✅ تم إرسال الإشعار بنجاح!", 201);
});



export const updateNotification = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can send notifications.", { cause: 403 }));
    }

    if (!req.body.email) {
        return next(new Error("❌ يجب توفير البريد الإلكتروني!", { cause: 400 }));
    }

    let secure_url = null;
    let public_id = null;

    const user = await Usermodel.findOne({ email: req.body.email });

    if (!user) {
        return next(new Error("❌ المستخدم غير موجود!", { cause: 404 }));
    }

    // التأكد من وجود notificationId لتحديد الإشعار المراد تعديله
    if (!req.body.notificationId) {
        return next(new Error("❌ يجب توفير معرف الإشعار (notificationId) لتحديد الإشعار!", { cause: 400 }));
    }

    // البحث عن الإشعار داخل المصفوفة باستخدام _id
    const notificationIndex = user.notifications.findIndex(
        (notif) => notif._id.toString() === req.body.notificationId
    );
    if (notificationIndex === -1) {
        return next(new Error("❌ الإشعار غير موجود!", { cause: 404 }));
    }

   
    if (req.file) {
  
        const oldImagePublicId = user.notifications[notificationIndex].image?.public_id;
        if (oldImagePublicId) {
            await cloud.uploader.destroy(oldImagePublicId);
        }

     
        const uploadResult = await cloud.uploader.upload(req.file.path, { folder: `orderdetails/${req.user._id}` });
        secure_url = uploadResult.secure_url;
        public_id = uploadResult.public_id;
    }

    // التأكد من وجود المدخلات المطلوبة لحالة الطلب إذا تم إرسالها
    if ((req.body.orderStatus_en && !req.body.orderStatus_ar) || (!req.body.orderStatus_en && req.body.orderStatus_ar)) {
        return next(new Error("❌ يجب توفير حالة الطلب باللغة العربية والإنجليزية معًا!", { cause: 400 }));
    }

    // تحديث البيانات مع الاحتفاظ بالقيم القديمة إذا لم تُرسل قيم جديدة
    const updatedNotification = {
        orderDate: req.body.orderDate || user.notifications[notificationIndex].orderDate,
        orderDetails: {
            en: req.body.orderDetails_en || user.notifications[notificationIndex].orderDetails.en,
            ar: req.body.orderDetails_ar || user.notifications[notificationIndex].orderDetails.ar
        },
        orderStatus: {
            en: req.body.orderStatus_en || user.notifications[notificationIndex].orderStatus.en,
            ar: req.body.orderStatus_ar || user.notifications[notificationIndex].orderStatus.ar
        },
        orderPaid: req.body.orderPaid || user.notifications[notificationIndex].orderPaid,
        ordervalue: req.body.ordervalue || user.notifications[notificationIndex].ordervalue,
        remainingAmount: req.body.remainingAmount || user.notifications[notificationIndex].remainingAmount,
        orderNumber: req.body.orderNumber || user.notifications[notificationIndex].orderNumber,
        image: secure_url ? { secure_url, public_id } : user.notifications[notificationIndex].image,
        updatedBy: req.user._id
    };

    // استبدال الإشعار القديم بالجديد
    user.notifications[notificationIndex] = updatedNotification;

    // حفظ التحديثات
    await user.save();

    return successresponse(res, "✅ تم تعديل الإشعار بنجاح!", 200);
});





export const getNotificationsByEmail = asyncHandelr(async (req, res, next) => {
 

    if (!req.body.email) {
        return next(new Error("❌ يجب توفير البريد الإلكتروني!", { cause: 400 }));
    }

    const user = await Usermodel.findOne({ email: req.body.email }).select("notifications");

    if (!user) {
        return next(new Error("❌ المستخدم غير موجود!", { cause: 404 }));
    }

    // التحقق من وجود إشعارات
    if (!user.notifications || user.notifications.length === 0) {
        return next(new Error("❌ لا توجد إشعارات لهذا المستخدم!", { cause: 404 }));
    }

    return successresponse(res, "✅ تم جلب الإشعارات بنجاح!", 200, { notifications: user.notifications });
});







export const updateCategory = asyncHandelr(async (req, res, next) => {
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can update categories.", { cause: 403 }));
    }

    const category = await CategoryModel.findById(req.params.categoryId);
    if (!category) {
        return next(new Error("Category not found!", { cause: 404 }));
    }

    let newImage = category.image;
    if (req.file) {
        const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `categories/${req.user._id}` });
        newImage = { secure_url, public_id };

        
        if (category.image.public_id) {
            await cloud.uploader.destroy(category.image.public_id);
        }
    }

    
    category.name.en = req.body.name_en || category.name.en;
    category.name.ar = req.body.name_ar || category.name.ar;
    category.image = newImage;
    category.updatedBy = req.user._id;
    await category.save();

    return successresponse(res, "Category updated successfully!", 200, );
});





export const getCategories = asyncHandelr(async (req, res, next) => {
    const categories = await dbservice.findAll({
        model: CategoryModel,
        select: 'name image secure_url public_id updatedBy createdAt updatedAt'
    });

    if (!categories.length) {
        return next(new Error("No categories found", { cause: 404 }));
    }

    return successresponse(res, "Categories retrieved successfully!", 200, { categories });
});

export const deleteCategory = asyncHandelr(async (req, res, next) => {
 
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can delete categories.", { cause: 403 }));
    }

   
    const category = await CategoryModel.findById(req.params.categoryId);
    if (!category) {
        return next(new Error("Category not found!", { cause: 404 }));
    }

  
    if (category.image?.public_id) {
        await cloud.uploader.destroy(category.image.public_id);
    }

   
    await category.deleteOne();

    return successresponse(res, "Category deleted successfully!", 200);
});



export const createdepatment = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create categories.", { cause: 403 }));
    }


   

    const category = await DepartmentModel.create({
        name: {
            en: req.body.name_en,
            ar: req.body.name_ar
        },
        
        updatedBy: req.user._id
    });

    return successresponse(res, "department created successfully!", 201,);
});


export const getdepartment = asyncHandelr(async (req, res, next) => {
    const department = await dbservice.findAll({
        model: DepartmentModel,
        select: 'name image secure_url public_id updatedBy createdAt updatedAt'
    });

    if (!department.length) {
        return next(new Error("No categories found", { cause: 404 }));
    }

    return successresponse(res, "department retrieved successfully!", 200, { department });
});


export const deletedepartment = asyncHandelr(async (req, res, next) => {

    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can delete categories.", { cause: 403 }));
    }


    const category = await DepartmentModel.findById(req.params.departmentId);
    if (!category) {
        return next(new Error("department not found!", { cause: 404 }));
    }


   

    await category.deleteOne();

    return successresponse(res, "department deleted successfully!", 200);
});

export const updatedepartment = asyncHandelr(async (req, res, next) => {
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can update categories.", { cause: 403 }));
    }

    const category = await DepartmentModel.findById(req.params.departmentId);
    if (!category) {
        return next(new Error("department not found!", { cause: 404 }));
    }

   


    category.name.en = req.body.name_en || category.name.en;
    category.name.ar = req.body.name_ar || category.name.ar;
 
    category.updatedBy = req.user._id;
    await category.save();

    return successresponse(res, "department updated successfully!", 200,);
});















export const createSocialMedia = asyncHandelr(async (req, res, next) => {
    const { phone, whatsapp, facebook, twitter, instagram, tiktok, snapchat, youtupe } = req.body;

    console.log("📩 Received Request Body:", req.body);

    // التحقق من وجود بيانات تواصل اجتماعي سابقة
    const existingSocialMedia = await SocialMediaModel.findOne();
    if (existingSocialMedia) {
        return next(new Error("❌ بيانات التواصل الاجتماعي موجودة بالفعل! يمكنك تعديلها.", { cause: 400 }));
    }

   
    const socialMedia = new SocialMediaModel({
        phone,
        whatsapp,
        facebook,
        twitter,
        instagram,
        tiktok,
        snapchat,
        youtupe
    });

    await socialMedia.save();

    return successresponse(res, "✅ تم إنشاء بيانات التواصل الاجتماعي بنجاح!", 201);
});






export const getSocialMedia = asyncHandelr(async (req, res, next) => {
    // البحث عن بيانات التواصل الاجتماعي
    const socialMedia = await SocialMediaModel.findOne();
    if (!socialMedia) {
        return next(new Error("❌ لا توجد بيانات تواصل اجتماعي!", { cause: 404 }));
    }

    return successresponse(res, "✅ تم جلب بيانات التواصل الاجتماعي بنجاح!", 200, { socialMedia });
});




export const updateSocialMedia = asyncHandelr(async (req, res, next) => {
    const { phone, whatsapp, facebook, twitter, instagram, tiktok, snapchat } = req.body;

    console.log("📩 Received Request Body:", req.body);

    // البحث عن بيانات التواصل الاجتماعي
    const socialMedia = await SocialMediaModel.findOne();
    if (!socialMedia) {
        return next(new Error("❌ لا توجد بيانات تواصل اجتماعي لتعديلها! قم بإنشائها أولاً.", { cause: 404 }));
    }

    // تحديث بيانات التواصل الاجتماعي (فقط الحقول المُرسلة)
    socialMedia.phone = phone || socialMedia.phone;
    socialMedia.whatsapp = whatsapp || socialMedia.whatsapp;
    socialMedia.facebook = facebook || socialMedia.facebook;
    socialMedia.twitter = twitter || socialMedia.twitter;
    socialMedia.instagram = instagram || socialMedia.instagram;
    socialMedia.tiktok = tiktok || socialMedia.tiktok;
    socialMedia.snapchat = snapchat || socialMedia.snapchat;

    await socialMedia.save();

    return successresponse(res, "✅ تم تحديث بيانات التواصل الاجتماعي بنجاح!", 200);
});