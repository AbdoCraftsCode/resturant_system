import * as dbservice from "../../../DB/dbservice.js"
import { BranchModel } from "../../../DB/models/branch.model.js";
import { CategoryModel } from "../../../DB/models/Category.model.js";

import { OrderModel } from "../../../DB/models/order.model.js";
import { ProductModel } from "../../../DB/models/product.model.js";
import Usermodel from "../../../DB/models/User.model.js";

import cloud from "../../../utlis/multer/cloudinary.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import bcrypt from "bcrypt"













export const createProduct = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);

    // التأكد من أن المستخدم لديه الصلاحية لإضافة منتج
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create products.", { cause: 403 }));
    }

    // التأكد من وجود الملفات
    if (!req.files || req.files.length === 0) {
        return next(new Error("❌ يجب رفع صورة واحدة على الأقل!", { cause: 400 }));
    }

  
    const images = await Promise.all(req.files.map(async (file) => {
        const uploadedImage = await cloud.uploader.upload(file.path, { folder: `products/${req.user._id}` });
        return { secure_url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
    }));

    const product = await ProductModel.create({
        name1: {
            en: req.body.name1_en,
            ar: req.body.name1_ar
        },
        name2: {
            en: req.body.name2_en,
            ar: req.body.name2_ar
        },
        newprice: req.body.newprice,
        oldprice: req.body.oldprice,
        description: {
            en: req.body.description_en,
            ar: req.body.description_ar
        },
        country: {
            en: req.body.country_en,
            ar: req.body.country_ar
        },
        quantity: {
            en: req.body.quantity_en,
            ar: req.body.quantity_ar
        },
        category: req.body.categoryId,
        createdBy: req.user._id,
        image: images 
    });

    return successresponse(res, "✅ المنتج تم إنشاؤه بنجاح!", 201);
});

 
export const getProducts = asyncHandelr(async (req, res, next) => {
    const { lang, categoryId, productName, page = 1, limit = 10 } = req.query;

    if (!categoryId) {
        return next(new Error("❌ يجب إدخال معرف التصنيف (categoryId)!", { cause: 400 }));
    }

    const validLang = lang && ["en", "ar"].includes(lang) ? lang : "en";
    const pageNumber = Math.max(1, parseInt(page)); // لا يقل عن 1
    const limitNumber = Math.max(1, parseInt(limit)); // لا يقل عن 1
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { category: categoryId };

    if (productName) {
        const regex = new RegExp(productName, "i");
        filter.$or = [
            { [`name1.${validLang}`]: { $regex: regex } },
            { [`name2.${validLang}`]: { $regex: regex } }
        ];
    }

    const totalProducts = await ProductModel.countDocuments(filter); // 🔹 حساب عدد المنتجات الكلي

    const products = await ProductModel.find(filter)
        .populate("category", `name.${validLang}`)
        .select([
            `name1.${validLang}`,
            `name2.${validLang}`,
            `description.${validLang}`,
            `quantity.${validLang}`,
            "newprice",
            "oldprice",
            "image"
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    if (products.length === 0) {
        return next(new Error("❌ لا توجد منتجات متاحة لهذا التصنيف!", { cause: 404 }));
    }

    const numberedProducts = products.map((product, index) => ({
        number: skip + index + 1, // الترقيم بناءً على الصفحة
        ...product.toObject()
    }));

    return successresponse(res, "✅ المنتجات تم جلبها بنجاح!", 200, {
        category: products.length > 0 ? products[0].category : null,
        products: numberedProducts,
        pagination: {
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNumber),
            currentPage: pageNumber,
            limit: limitNumber
        }
    });
});

export const getProductswithout = asyncHandelr(async (req, res, next) => {
    const { lang, productName, page = 1, limit = 10 } = req.query;

    const validLang = lang && ["en", "ar"].includes(lang) ? lang : "en";
    const pageNumber = Math.max(1, parseInt(page)); // لا يقل عن 1
    const limitNumber = Math.max(1, parseInt(limit)); // لا يقل عن 1
    const skip = (pageNumber - 1) * limitNumber;

    let filter = {};

    if (productName) {
        const regex = new RegExp(productName, "i");
        filter.$or = [
            { [`name1.${validLang}`]: { $regex: regex } },
            { [`name2.${validLang}`]: { $regex: regex } }
        ];
    }

    const totalProducts = await ProductModel.countDocuments(filter); // 🔹 حساب إجمالي المنتجات

    const products = await ProductModel.find(filter)
        .select([
            `name1.${validLang}`,
            `name2.${validLang}`,
            `description.${validLang}`,
            `quantity.${validLang}`,
            "newprice",
            "oldprice",
            "image"
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    if (products.length === 0) {
        return next(new Error("❌ لا توجد منتجات متاحة!", { cause: 404 }));
    }

    const numberedProducts = products.map((product, index) => ({
        number: skip + index + 1, // 🔹 الترقيم بناءً على الصفحة
        ...product.toObject()
    }));

    return successresponse(res, "✅ المنتجات تم جلبها بنجاح!", 200, {
        products: numberedProducts,
        pagination: {
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNumber),
            currentPage: pageNumber,
            limit: limitNumber
        }
    });
});

 

export const deleteProduct = asyncHandelr(async (req, res, next) => {
    const { productId } = req.params;

    
    if (!productId) {
        return next(new Error("❌ يجب إدخال معرف المنتج!", { cause: 400 }));
    }


    const product = await ProductModel.findById(productId);
    if (!product) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

  
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("❌ غير مصرح لك بحذف المنتجات!", { cause: 403 }));
    }

   
    if (product.image && product.image.length > 0) {
        await Promise.all(
            product.image.map(async (img) => {
                if (img.public_id) {
                    await cloud.uploader.destroy(img.public_id);
                }
            })
        );
    }

   
    await ProductModel.findByIdAndDelete(productId);

    return successresponse(res, "✅ تم حذف المنتج وجميع صوره بنجاح!", 200);
});
export const updateProduct = asyncHandelr(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        return next(new Error("❌ يجب إدخال معرف المنتج!", { cause: 400 }));
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

    
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("❌ غير مصرح لك بتعديل المنتجات!", { cause: 403 }));
    }

    let images = [...product.image]; 
    if (req.files && req.files.length > 0) {
        
        await Promise.all(product.image.map(img => cloud.uploader.destroy(img.public_id)));

        
        images = await Promise.all(req.files.map(async (file) => {
            const uploadedImage = await cloud.uploader.upload(file.path, { folder: `products/${req.user._id}` });
            return { secure_url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
        }));
    }

   
 const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        {
            name1: {
                en: req.body.name1_en || product.name1.en,
                ar: req.body.name1_ar || product.name1.ar
            },
            name2: {
                en: req.body.name2_en || product.name2.en,
                ar: req.body.name2_ar || product.name2.ar
            },
            newprice: req.body.newprice || product.newprice,
            oldprice: req.body.oldprice || product.oldprice,
            description: {
                en: req.body.description_en || product.description.en,
                ar: req.body.description_ar || product.description.ar
            },
            quantity: {
                en: req.body.quantity_en || product.quantity.en,
                ar: req.body.quantity_ar || product.quantity.ar
            },
            category: req.body.categoryId || product.category,
            image: images 
        },
        { new: true }
    );

    return successresponse(res, "✅ المنتج تم تحديثه بنجاح!", 200);
});
export const deleteProductImage = asyncHandelr(async (req, res, next) => {
    const { productId, publicId } = req.body;

    if (!productId || !publicId) {
        return next(new Error("❌ يجب إرسال معرف المنتج ومعرف الصورة!", { cause: 400 }));
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

    const imageIndex = product.image.findIndex(img => img.public_id === publicId);
    if (imageIndex === -1) {
        return next(new Error("❌ الصورة غير موجودة في هذا المنتج!", { cause: 404 }));
    }

    await cloud.uploader.destroy(publicId);

    
    product.image.splice(imageIndex, 1);
    await product.save();

    return successresponse(res, "✅ تم حذف الصورة بنجاح!", 200);
});


export const createOrder = asyncHandelr(async (req, res, next) => {
    const { products, address, phone, notes } = req.body;

    if (!products || products.length === 0 || !address || !phone) {
        return next(new Error("❌ جميع الحقول مطلوبة!", { cause: 400 }));
    }

    const newOrder = await OrderModel.create({
        user: req.user._id,
        products,
        address,
        phone,
        notes
    });

    return successresponse(res, "✅ تم إنشاء الطلب بنجاح!", 201);
});



export const getAllOrders = asyncHandelr(async (req, res, next) => {
    const orders = await OrderModel.find()
        .populate("user", "lastName firstName email mobileNumber")
        .populate("products.productId", "name1 newprice ");

    return successresponse(res, "✅ جميع الطلبات!", 200, { orders });
});


export const cancelOrder = asyncHandelr(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await OrderModel.findOneAndDelete({ _id: orderId, user: req.user._id });

    if (!order) {
        return next(new Error("❌ الطلب غير موجود أو لا تملك صلاحية حذفه!", { cause: 403 }));
    }

    return successresponse(res, "✅ تم حذف الطلب نهائيًا!", 200);
});


export const sendNotificationToUser = asyncHandelr(async (req, res, next) => {
    const { email, phone, name, titleEn, titleAr, messageEn, messageAr } = req.body;

    console.log("📩 Received Request Body:", req.body);

    const admin = await Usermodel.findById(req.user._id);
    console.log("👤 Admin Info:", admin);

    if (!titleEn || !titleAr || !messageEn || !messageAr) {
        return next(new Error("❌ جميع حقول الإشعار مطلوبة!", { cause: 400 }));
    }

    // ✅ البحث عن المستخدم بناءً على المعايير المحددة
    let userFilter = {};
    if (email) userFilter.email = email;
    if (phone) userFilter.mobileNumber = phone;
    if (name) {
        userFilter.$or = [
            { firstName: name },
            { lastName: name }
        ];
    }

    const user = await Usermodel.findOne(userFilter);

    // ❌ التأكد من أن المستخدم موجود قبل المتابعة
    if (!user) {
        return next(new Error("❌ المستخدم غير موجود في النظام!", { cause: 404 }));
    }

    // ❌ التأكد من عدم إرسال الإشعار لنفس الشخص
    if (user._id.toString() === admin._id.toString()) {
        return next(new Error("❌ لا يمكنك إرسال إشعار لنفسك!", { cause: 400 }));
    }

    // ✅ إضافة الإشعار إلى بيانات المستخدم
    user.notifications.push({
        title: { en: titleEn, ar: titleAr },
        message: { en: messageEn, ar: messageAr }
    });

    await user.save();

    return successresponse(res, "✅ تم إرسال الإشعار بنجاح!", 200);
});


export const createAdminByOwner = asyncHandelr(async (req, res, next) => {
    const { email, firstName, lastName, mobileNumber, password, city } = req.body;

    // ✅ التحقق من أن المستخدم هو Owner
    const owner = await Usermodel.findById(req.user._id);
    if (!owner || owner.role !== "Owner") {
        return next(new Error("❌ ليس لديك صلاحية لإنشاء حساب Admin!", { cause: 403 }));
    }

    // ✅ التحقق من عدم وجود البريد الإلكتروني مسبقًا
    const existingEmail = await Usermodel.findOne({ email });
    if (existingEmail) {
        return next(new Error("❌ البريد الإلكتروني مستخدم بالفعل!", { cause: 400 })); 
    }

    // ✅ التحقق من عدم وجود رقم الهاتف مسبقًا
    const existingPhone = await Usermodel.findOne({ mobileNumber });
    if (existingPhone) {
        return next(new Error("❌ رقم الهاتف مستخدم بالفعل!", { cause: 400 })); 
    }

    // ✅ إنشاء Admin جديد مع isConfirmed: true
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newAdmin = new Usermodel({
        email,
        firstName,
        lastName,
        mobileNumber,
        password: hashedPassword,
        city,
        role: "Admin", // تعيين الدور إلى Admin
        isConfirmed: true // جعل الحساب مؤكد دائمًا
    });

    await newAdmin.save();

    return successresponse(res, {
        message: "✅ تم إنشاء حساب Admin بنجاح!",
        admin: {
            id: newAdmin._id,
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            mobileNumber: newAdmin.mobileNumber,
            city: newAdmin.city,
            role: newAdmin.role,
            isConfirmed: newAdmin.isConfirmed
        }
    }, 201);
});




export const updateAdminByOwner = asyncHandelr(async (req, res, next) => {
    const { adminId } = req.params;
    const { firstName, lastName, email, mobileNumber, city } = req.body;

    // ✅ التحقق من أن المستخدم هو Owner
    const owner = await Usermodel.findById(req.user._id);
    if (!owner || owner.role !== "Owner") {
        return next(new Error("❌ ليس لديك صلاحية لتعديل بيانات Admin!", { cause: 403 }));
    }

    // ✅ البحث عن الـ Admin المستهدف بالتعديل
    const admin = await Usermodel.findById(adminId);
    if (!admin || admin.role !== "Admin") {
        return next(new Error("❌ لا يمكن العثور على الـ Admin!", { cause: 404 }));
    }

    // ✅ التحقق من عدم تكرار البريد الإلكتروني
    if (email && email !== admin.email) {
        const existingUser = await Usermodel.findOne({ email });
        if (existingUser) {
            return next(new Error("❌ البريد الإلكتروني مستخدم بالفعل!", { cause: 400 }));
        }
        admin.email = email;
    }

    // ✅ تحديث البيانات المتبقية
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (mobileNumber) admin.mobileNumber = mobileNumber;
    if (city) admin.city = city;

    await admin.save();

    return successresponse(res, "✅ تم تعديل بيانات الـ Admin بنجاح!", 200, {
        admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            mobileNumber: admin.mobileNumber,
            city: admin.city
        }
    });
});

export const searchUsersByName = asyncHandelr(async (req, res, next) => {
    const { name } = req.query;

    if (!name || name.length < 1) {
        return next(new Error("❌ يجب إدخال حرف واحد على الأقل للبحث!", { cause: 400 }));
    }

    // البحث باستخدام Regex لجلب الأسماء التي تبدأ بالحروف المدخلة
    const users = await Usermodel.find({
        $or: [
            { firstName: { $regex: `^${name}`, $options: "i" } },
            { lastName: { $regex: `^${name}`, $options: "i" } }
        ]
    })
        .limit(10)
        .select("firstName lastName email mobileNumber"); // تحديد البيانات المطلوبة فقط

    // تعديل البيانات لإرجاع الاسم الكامل
    const formattedUsers = users.map(user => ({
        id: user._id,
        username: `${user.firstName} ${user.lastName}`,
        email: user.email,
        mobileNumber: user.mobileNumber
    }));

    return successresponse(res, "✅ نتائج البحث", 200, { users: formattedUsers });
});

export const deleteAdminByOwner = asyncHandelr(async (req, res, next) => {
    const { adminId } = req.params;

 
    const owner = await Usermodel.findById(req.user._id);
    if (!owner || owner.role !== "Owner") {
        return next(new Error("❌ ليس لديك صلاحية لحذف Admin!", { cause: 403 }));
    }

    const admin = await Usermodel.findById(adminId);
    if (!admin || admin.role !== "Admin") {
        return next(new Error("❌ لا يمكن العثور على الـ Admin!", { cause: 404 }));
    }

    await Usermodel.findByIdAndDelete(adminId);

    return successresponse(res, "✅ تم حذف الـ Admin بنجاح!", 200);
});
export const getAllAdmins = asyncHandelr(async (req, res, next) => {
    const admins = await Usermodel.find({ role: "Admin" })
        .select("firstName lastName email mobileNumber city") // تحديد البيانات المهمة فقط
        .limit(10); // تحديد عدد النتائج في كل استعلام

    // تنسيق البيانات قبل الإرجاع
    const formattedAdmins = admins.map(admin => ({
        id: admin._id,
        username: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        mobileNumber: admin.mobileNumber,
        city: admin.city
    }));

    return successresponse(res, "✅ قائمة المدراء", 200, { admins: formattedAdmins });
});
export const createBranch = asyncHandelr(async (req, res, next) => {
    const { nameEn, nameAr, addressEn, addressAr, locationLink } = req.body;

    // ✅ التحقق من الصلاحيات (يجب أن يكون المستخدم Owner أو Admin)
    if (!["Owner", "Admin"].includes(req.user.role)) {
        return next(new Error("❌ ليس لديك صلاحية لإنشاء فرع!", { cause: 403 }));
    }

    // ✅ التحقق من إدخال البيانات الأساسية
    if (!nameEn || !nameAr || !addressEn || !addressAr) {
        return next(new Error("❌ جميع الحقول مطلوبة (الاسم والعنوان باللغتين)!", { cause: 400 }));
    }

    const branch = await BranchModel.create({
        name: { en: nameEn, ar: nameAr },
        address: { en: addressEn, ar: addressAr },
        locationLink
    });

    return successresponse(res, "✅ تم إنشاء الفرع بنجاح!", 201, );
});

export const getAllBranches = asyncHandelr(async (req, res, next) => {
    const { lang } = req.query; // 🔹 تحديد اللغة من `query` (ar أو en)

    const branches = await BranchModel.find();

    // ✅ إذا تم تحديد لغة، يتم إرجاع الفروع بهذه اللغة فقط
    const formattedBranches = branches.map(branch => ({
        name: lang && branch.name[lang] ? branch.name[lang] : branch.name,
        address: lang && branch.address[lang] ? branch.address[lang] : branch.address,
        locationLink: branch.locationLink
    }));

    return successresponse(res, "✅ تم جلب جميع الفروع بنجاح!", 200, formattedBranches);
});


export const deleteBranch = asyncHandelr(async (req, res, next) => {
    const { branchId } = req.params;

    // ✅ التحقق من الصلاحيات (يجب أن يكون المستخدم Owner أو Admin)
    if (!["Owner", "Admin"].includes(req.user.role)) {
        return next(new Error("❌ ليس لديك صلاحية لحذف الفرع!", { cause: 403 }));
    }

    const branch = await BranchModel.findById(branchId);
    if (!branch) {
        return next(new Error("❌ الفرع غير موجود!", { cause: 404 }));
    }

    await branch.deleteOne();

    return successresponse(res, "✅ تم حذف الفرع بنجاح!", 200);
});











