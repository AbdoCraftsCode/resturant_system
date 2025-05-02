import * as dbservice from "../../../DB/dbservice.js"
import { AdvirtModel } from "../../../DB/models/advertise.model.js";
import { BranchModel } from "../../../DB/models/branch.model.js";
import { CategoryModel } from "../../../DB/models/Category.model.js";
import { HatapModel } from "../../../DB/models/hatap.model.js";
import { mixModel } from "../../../DB/models/mix.model.js";
import { MostawdaaModel } from "../../../DB/models/mostoda3.model.js";
import { AdminNotificationModel } from "../../../DB/models/notification.admin.model.js";

import { OrderModel } from "../../../DB/models/order.model.js";
import { ProductModel } from "../../../DB/models/product.model.js";
import Usermodel from "../../../DB/models/User.model.js";
import admin from 'firebase-admin';
import cloud from "../../../utlis/multer/cloudinary.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import bcrypt from "bcrypt"


// const serviceAccount = {
//     type: "service_account",
//     project_id: "merba3-f8802",
//     private_key_id: "3e7a5bb045c3be0f157873eaf27ac985b14c2565",
//     private_key: `-----BEGIN PRIVATE KEY-----
// MIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCeNOD1B8bHVCy5
// sGPBgTnQCeGItj2/xY5RxvEzdpcKX3c9LpqwuVOwuPPt07jgjTypMX7ybC/VJVzw
// imChZLPYo3lodhaZDVHGAjKeRcukomMn4VrGucyIyKlz4XB5KMBXzY4XjEJfq557
// hI23LExgW+rK6WMLGvKtOOdiFUALKRSXofchOuCEGWW/n+aZ6+85m2TdY9wMFeEU
// efFIS13LvgI5yFg38jXTviECrc6Ni/P2aP5E9TfBU7JHmu59Da3P0JtGnwm2mhap
// Uvhoz5CoUVrKsZe0vimjZwm9ue8godh6y18MYjChwDZzpcjgM8roZnjiEAw2BAGR
// H+SqSUzFAgMBAAECgf8cDa42q3TfL5O+uyLNY2CzMXwtVGyoGPrVNRhJ29WkEHnQ
// gIP/8Nz6fGO9A/4MRIVIQ9eJckOetU4h80Do6kpODxt21B3O9ewmuQqea5LY+4uH
// WR+q40/Fi5OpvBCkwu4U4cu7I7gohSxddFrzwA2vWW/LeRlYo8O4N92MLOOyhpWQ
// BFeh3fxR1mK8ktZFF0f7yCaMmOPFZeOWF4YueBjTVfQwtxEskFHHR+uhNCdgTlBo
// r2o30leAHJjrojDhbueraDcf+jrU0Bu9icE4PWBEuVfpQ/apTse51uI/2vhGgFOL
// +0Mg4ILASrS+ndSK0TdH4ajEiLiU+XTjcpvWWkECgYEAz78L+JxwN2IZH5T0uSe4
// E4UYK7wDdjzcKPdCo4JOjAlrsdvDbhq2iDGaetLQJUcU6sYeGhvfWe0gkT7zTrvv
// KEsJrPwBZztc9AsrFo00pSBMchSpLZnlC5s0MuIPYSC/yqmW30VeMprKKg4IQyu/
// vcEa+Mo8r2u08DMuvakPIAUCgYEAwvQdUgq9/Aqdz+ho5XfuVc0rEAHrsCzmDnpZ
// Y9ncalHlFurIhi6rs/SHOyCoiGXo/YdBWCq6z4HMvTYN9qhj/tnfU+BSMCElZGQI
// Xj2OavaWtPl4R3Xi1wIP2N2Wxs2wMMMABsDEoxrdyqSTc3bPGItuNkA/56GtCq6T
// D/mm1cECgYBDeLQFoaFci3LHbBRzUjAZvt9TzPN+4lNKxsuQ2VBzcNfWYx680tY3
// s4yNmYxanxRvD7tVFXpb9YTfR4e0KZuKBZz13r8B7SjKZhovb9sKSkwpvQYZNmNK
// erTgVcVS8VT5GE1U5G2sl9NTB02tqzbSBTaiWOSOwLd6T9U9afvslQKBgGm8bv6l
// Vt+RfoBaBDKY9opQyc9Xy1X1NB2cHEl8ywBbRI5GbtXgED59HK9kCiRYaaLALh+8
// pS+QrdPdsnsaX4nE70yVuN3jzF0DqEo8xraa4ahsOeFAPfTxaFjt7i4LN0lrKeN/
// v+ba1npnApY4VSBx1yfTdxWRacIGZzrd46/BAoGATZke5s3oS8OX3hvr5zULP84J
// iHTqGpWHYQzkRFxN7b934nTO6GsF+Rx4xf5tlZldnjo2HB5KpkIEoT/6AcpiSTYQ
// PMXdIUigLU5Miv9iwRSOQSUibSPnlSyCS5wKXQV/wVPoU+B1yrEr71Ii3BxEFQ3b
// Ucztf8+48J9J+qMzTbQ=
// -----END PRIVATE KEY-----`,
//     client_email: "firebase-adminsdk-fbsvc@merba3-f8802.iam.gserviceaccount.com",
//     client_id: "116339282509322684729",
//     auth_uri: "https://accounts.google.com/o/oauth2/auth",
//     token_uri: "https://oauth2.googleapis.com/token",
//     auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//     client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40merba3-f8802.iam.gserviceaccount.com",
//     universe_domain: "googleapis.com",
// };

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// })
// دالة إرسال إشعار
// async function sendNotification(deviceToken, title, body) {
//     const message = {
//         notification: { title, body },
//         token: deviceToken,
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         console.log('✅ تم إرسال الإشعار:', response);
//     } catch (error) {
//         console.error('❌ فشل إرسال الإشعار:', error);
//     }
// }














export const createProduct = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    console.log("Request Body:", req.body);

    // التأكد من أن المستخدم لديه الصلاحية
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create products.", { cause: 403 }));
    }

    // تأكد من وجود صور
    const productImages = req.files?.image || [];
    const logoImages = req.files?.logo || [];

    if (!productImages.length) {
        return next(new Error("❌ يجب رفع صورة واحدة على الأقل للمنتج!", { cause: 400 }));
    }

    // رفع صور المنتج
    const uploadedProductImages = await Promise.all(productImages.map(async (file) => {
        const uploaded = await cloud.uploader.upload(file.path, {
            folder: `products/${req.user._id}`
        });
        return { secure_url: uploaded.secure_url, public_id: uploaded.public_id };
    }));

    // رفع اللوجو (اختياري)
    const uploadedLogos = await Promise.all(logoImages.map(async (file) => {
        const uploaded = await cloud.uploader.upload(file.path, {
            folder: `products/${req.user._id}/logo`
        });
        return { secure_url: uploaded.secure_url, public_id: uploaded.public_id };
    }));

    // تحويل tableData لو موجود
    let tableData = [];
    if (req.body.tableData) {
        try {
            tableData = JSON.parse(req.body.tableData);
        } catch (error) {
            return next(new Error("❌ تنسيق tableData غير صحيح! يجب أن يكون JSON صالح.", { cause: 400 }));
        }
    }

    // إنشاء المنتج
    const product = await ProductModel.create({
        name1: {
            en: req.body.name1_en,
            ar: req.body.name1_ar
        },
        stoargecondition: {
            en: req.body.stoargecondition_en,
            ar: req.body.stoargecondition_ar
        },
        name2: {
            en: req.body.name2_en,
            ar: req.body.name2_ar
        },
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
        Department: req.body.departmentId,
        createdBy: req.user._id,
        image: uploadedProductImages,
        logo: uploadedLogos,
        tableData: tableData.map(item => ({
            name: {
                en: item.name_en,
                ar: item.name_ar
            },
            value: {
                en: item.value_en,
                ar: item.value_ar
            }
        })),
        animalTypes: req.body.animalTypes ? JSON.parse(req.body.animalTypes).map(item => ({
            ar: item.ar,
            en: item.en
        })) : []
    });

    return successresponse(res, "✅ المنتج تم إنشاؤه بنجاح!", 201);
});

export const createHatap = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    console.log("Request Body:", req.body);

    // التأكد من أن المستخدم لديه الصلاحية
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create products.", { cause: 403 }));
    }

    // تأكد من وجود صور
    const productImages = req.files?.image || [];
    const logoImages = req.files?.logo || [];

    if (!productImages.length) {
        return next(new Error("❌ يجب رفع صورة واحدة على الأقل للمنتج!", { cause: 400 }));
    }

    // رفع صور المنتج
    const uploadedProductImages = await Promise.all(productImages.map(async (file) => {
        const uploaded = await cloud.uploader.upload(file.path, {
            folder: `products/${req.user._id}`
        });
        return { secure_url: uploaded.secure_url, public_id: uploaded.public_id };
    }));

    // رفع اللوجو (اختياري)
    const uploadedLogos = await Promise.all(logoImages.map(async (file) => {
        const uploaded = await cloud.uploader.upload(file.path, {
            folder: `products/${req.user._id}/logo`
        });
        return { secure_url: uploaded.secure_url, public_id: uploaded.public_id };
    }));

    // تحويل tableData لو موجود
    let tableData = [];
    if (req.body.tableData) {
        try {
            tableData = JSON.parse(req.body.tableData);
        } catch (error) {
            return next(new Error("❌ تنسيق tableData غير صحيح! يجب أن يكون JSON صالح.", { cause: 400 }));
        }
    }

    // إنشاء المنتج
    const product = await HatapModel.create({
        name1: {
            en: req.body.name1_en,
            ar: req.body.name1_ar
        },
        stoargecondition: {
            en: req.body.stoargecondition_en,
            ar: req.body.stoargecondition_ar
        },
        name2: {
            en: req.body.name2_en,
            ar: req.body.name2_ar
        },
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

        stoargecondition: {
            en: req.body.stoargecondition_en,
            ar: req.body.stoargecondition_ar
        },
        newprice: req.body.newprice,
        oldprice: req.body.oldprice,
        createdBy: req.user._id,
        image: uploadedProductImages,
        logo: uploadedLogos,
        tableData: tableData.map(item => ({
            name: {
                en: item.name_en,
                ar: item.name_ar
            },
            value: {
                en: item.value_en,
                ar: item.value_ar
            }
        })),
      
    });

    return successresponse(res, "✅ المنتج تم إنشاؤه بنجاح!", 201);
});








// [{ "name_en": "Weight", "name_ar": "الوزن", "value_en": "500", "value_ar": "500 " }
// ]



 
// export const getProducts = asyncHandelr(async (req, res, next) => {
//     const { categoryId, departmentId, page = 1, limit = 10 } = req.query;

//     const pageNumber = Math.max(1, parseInt(page));
//     const limitNumber = Math.max(1, parseInt(limit));
//     const skip = (pageNumber - 1) * limitNumber;

//     let filter = {};
//     let populateCategory = null;
//     let populateDepartment = null;

//     if (categoryId) {
//         filter.category = categoryId;
//         populateCategory = { path: "category", select: "name" }; // سيتم استخدامه فقط إذا وُجد categoryId
//     }

//     if (departmentId) {
//         filter.Department = departmentId;
//         populateDepartment = { path: "Department", select: "name" }; // سيتم استخدامه فقط إذا وُجد departmentId
//     }

//     const totalProducts = await ProductModel.countDocuments(filter);

//     const query = ProductModel.find(filter)
//         .select([
//             "name1",
//             "name2",
//             "description",
//             "quantity",
//             // "newprice",
//             // "oldprice",
//             "country",
//             "image",
//             "tableData",
//             "stoargecondition",
//             "animalTypes"
//         ])
//         .sort({ order: 1 })
//         .skip(skip)
//         .limit(limitNumber);


//     if (populateCategory) {
//         query.populate(populateCategory);
//     }

   
//     if (populateDepartment) {
//         query.populate(populateDepartment);
//     }

//     const products = await query.exec();

//     if (categoryId && products.length === 0) {
//         return next(new Error("❌ لا توجد منتجات متاحة لهذا التصنيف!", { cause: 404 }));
//     }

//     if (departmentId && products.length === 0) {
//         return next(new Error("❌ لا توجد منتجات متاحة لهذا القسم!", { cause: 404 }));
//     }

//     const numberedProducts = products.map((product, index) => ({
//         number: skip + index + 1,
//         ...product.toObject()
//     }));

//     const responseData = {
//         products: numberedProducts,
//         pagination: {
//             totalProducts,
//             totalPages: Math.ceil(totalProducts / limitNumber),
//             currentPage: pageNumber,
//             limit: limitNumber
//         }
//     };

//     if (categoryId && products.length > 0) {
//         responseData.category = products[0].category;
//     }

//     if (departmentId && products.length > 0) {
//         responseData.department = products[0].Department;
//     }

//     return successresponse(res, "✅ المنتجات تم جلبها بنجاح!", 200, responseData);
// });









export const getProducts = asyncHandelr(async (req, res, next) => {
    const { departmentId } = req.query;

    let filter = {};
    let populateDepartment = null;

    if (departmentId) {
        filter.Department = departmentId;
        populateDepartment = { path: "Department", select: "name" };
    }

    const products = await ProductModel.find(filter)
        .select([
            "name1",
            "name2",
            "description",
            "quantity",
            // "newprice",
            // "oldprice",
            "country",
            "image",
            "tableData",
            "stoargecondition",
            "animalTypes",
            "logo"
        ])
        .sort({ order: 1 })
        .populate(populateDepartment || "") // لن يتم تنفيذ populate إذا لم يوجد departmentId
        .exec();

    if (departmentId && products.length === 0) {
        return next(new Error("❌ لا توجد منتجات متاحة لهذا القسم!", { cause: 404 }));
    }

    const numberedProducts = products.map((product, index) => ({
        number: index + 1,
        ...product.toObject()
    }));

    const responseData = {
        products: numberedProducts
    };

    if (departmentId && products.length > 0) {
        responseData.department = products[0].Department;
    }

    return successresponse(res, "✅ المنتجات تم جلبها بنجاح!", 200, responseData);
});



export const gethatap = asyncHandelr(async (req, res, next) => {
    const { departmentId, page = 1, limit = 10 } = req.query; // إضافة page و limit مع قيم افتراضية

    let filter = {};
    let populateDepartment = null;

    if (departmentId) {
        filter.Department = departmentId;
        populateDepartment = { path: "Department", select: "name" };
    }

    const skip = (page - 1) * limit; // حساب كم منتج نتخطاه

    // حساب التوتال
    const totalProducts = await HatapModel.countDocuments(filter);

    const products = await HatapModel.find(filter)
        .select([
            "name1",
            "name2",
            "description",
            "quantity",
            "newprice",
            "oldprice",
            "country",
            "image",
            "tableData",
            "stoargecondition",
            "animalTypes",
            "logo"
        ])
        .sort({ order: 1 })
        .populate(populateDepartment || "")
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

    if (departmentId && products.length === 0) {
        return next(new Error("❌ لا توجد منتجات متاحة لهذا القسم!", { cause: 404 }));
    }

    const numberedProducts = products.map((product, index) => ({
        number: skip + index + 1,
        ...product.toObject()
    }));

    const responseData = {
        products: numberedProducts,
        pagination: {
            currentPage: parseInt(page),
            limit: parseInt(limit),
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit)
        }
    };

    if (departmentId && products.length > 0) {
        responseData.department = products[0].Department;
    }

    return successresponse(res, "✅ المنتجات تم جلبها بنجاح!", 200, responseData);
});




export const reorderProduct = asyncHandelr(async (req, res, next) => {
    const { productId, newIndex } = req.body;

    if (!productId || typeof newIndex !== "number") {
        return next(new Error("❌ يجب إرسال معرف المنتج و الـ index الجديد!", { cause: 400 }));
    }

    // 1. هات كل المنتجات مرتبة
    const products = await ProductModel.find().sort({ order: 1 });

    // 2. لاقي المنتج اللي محتاج تحركه
    const movingProductIndex = products.findIndex(p => p._id.toString() === productId);
    if (movingProductIndex === -1) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

    const [movingProduct] = products.splice(movingProductIndex, 1); // شيل المنتج

    // 3. دخله في المكان الجديد
    products.splice(newIndex, 0, movingProduct);

    // 4. عدل ترتيب كل المنتجات
    for (let i = 0; i < products.length; i++) {
        products[i].order = i;
        await products[i].save();
    }

    return successresponse(res, "✅ تم تحديث ترتيب المنتج بنجاح!", 200);
});





export const reorderHatap = asyncHandelr(async (req, res, next) => {
    const { productId, newIndex } = req.body;

    if (!productId || typeof newIndex !== "number") {
        return next(new Error("❌ يجب إرسال معرف المنتج و الـ index الجديد!", { cause: 400 }));
    }

    // 1. هات كل المنتجات مرتبة
    const products = await HatapModel.find().sort({ order: 1 });

    // 2. لاقي المنتج اللي محتاج تحركه
    const movingProductIndex = products.findIndex(p => p._id.toString() === productId);
    if (movingProductIndex === -1) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

    const [movingProduct] = products.splice(movingProductIndex, 1); // شيل المنتج

    // 3. دخله في المكان الجديد
    products.splice(newIndex, 0, movingProduct);

    // 4. عدل ترتيب كل المنتجات
    for (let i = 0; i < products.length; i++) {
        products[i].order = i;
        await products[i].save();
    }

    return successresponse(res, "✅ تم تحديث ترتيب المنتج بنجاح!", 200);
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



export const deleteHatap = asyncHandelr(async (req, res, next) => {
    const { productId } = req.params;


    if (!productId) {
        return next(new Error("❌ يجب إدخال معرف المنتج!", { cause: 400 }));
    }


    const product = await HatapModel.findById(productId);
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


    await HatapModel.findByIdAndDelete(productId);

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

    // تحديث الصور
    let images = [...product.image];
    if (req.files?.image?.length > 0) {
        await Promise.all(product.image.map(img => cloud.uploader.destroy(img.public_id)));
        images = await Promise.all(req.files.image.map(async (file) => {
            const uploadedImage = await cloud.uploader.upload(file.path, {
                folder: `products/${req.user._id}`
            });
            return {
                secure_url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id
            };
        }));
    } else if ('image' in req.body && (!req.files?.image || req.files.image.length === 0)) {
        // إذا تم إرسال المفتاح بدون صور
        await Promise.all(product.image.map(img => cloud.uploader.destroy(img.public_id)));
        images = [];
    }

    // تحديث اللوجو
    let logo = [...(product.logo || [])];
    if (req.files?.logo?.length > 0) {
        await Promise.all(logo.map(img => cloud.uploader.destroy(img.public_id)));
        logo = await Promise.all(req.files.logo.map(async (file) => {
            const uploadedLogo = await cloud.uploader.upload(file.path, {
                folder: `products/${req.user._id}/logo`
            });
            return {
                secure_url: uploadedLogo.secure_url,
                public_id: uploadedLogo.public_id
            };
        }));
    } else if ('logo' in req.body && (!req.files?.logo || req.files.logo.length === 0)) {
        // إذا تم إرسال مفتاح logo بدون صور
        await Promise.all(logo.map(img => cloud.uploader.destroy(img.public_id)));
        logo = [];
    }

    // معالجة tableData
    let tableData = product.tableData;
    if (req.body.tableData) {
        try {
            const parsedTableData = JSON.parse(req.body.tableData);
            tableData = parsedTableData.map(item => ({
                name: {
                    en: item.name_en,
                    ar: item.name_ar
                },
                value: {
                    en: item.value_en,
                    ar: item.value_ar
                }
            }));
        } catch (error) {
            return next(new Error("❌ تنسيق tableData غير صحيح! يجب أن يكون JSON صالح.", { cause: 400 }));
        }
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        {
            name1: {
                en: req.body.name1_en || product.name1.en,
                ar: req.body.name1_ar || product.name1.ar
            },
            country: {
                en: req.body.country_en || product.country.en,
                ar: req.body.country_ar || product.country.ar
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
            image: images,
            logo: logo,
            tableData: tableData,
            stoargecondition: {
                en: req.body.stoargecondition_en || product.stoargecondition.en,
                ar: req.body.stoargecondition_ar || product.stoargecondition.ar
            },
            animalTypes: req.body.animalTypes ? JSON.parse(req.body.animalTypes) : product.animalTypes
        },
        { new: true }
    );

    return successresponse(res, "✅ المنتج تم تحديثه بنجاح!", 200);
});







export const updateHatap = asyncHandelr(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        return next(new Error("❌ يجب إدخال معرف المنتج!", { cause: 400 }));
    }

    const product = await HatapModel.findById(productId);
    if (!product) {
        return next(new Error("❌ المنتج غير موجود!", { cause: 404 }));
    }

    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("❌ غير مصرح لك بتعديل المنتجات!", { cause: 403 }));
    }

    // تحديث الصور
    let images = [...product.image];
    if (req.files?.image && req.files.image.length > 0) {
        await Promise.all(product.image.map(img => cloud.uploader.destroy(img.public_id)));
        images = await Promise.all(req.files.image.map(async (file) => {
            const uploadedImage = await cloud.uploader.upload(file.path, {
                folder: `products/${req.user._id}`
            });
            return { secure_url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
        }));
    }

    // تحديث اللوجو
    let logo = [...(product.logo || [])];
    if (req.files?.logo && req.files.logo.length > 0) {
        await Promise.all(logo.map(img => cloud.uploader.destroy(img.public_id)));
        logo = await Promise.all(req.files.logo.map(async (file) => {
            const uploadedLogo = await cloud.uploader.upload(file.path, {
                folder: `products/${req.user._id}/logo`
            });
            return { secure_url: uploadedLogo.secure_url, public_id: uploadedLogo.public_id };
        }));
    }

    // معالجة tableData
    let tableData = product.tableData;
    if (req.body.tableData) {
        try {
            const parsedTableData = JSON.parse(req.body.tableData);
            tableData = parsedTableData.map(item => ({
                name: {
                    en: item.name_en,
                    ar: item.name_ar
                },
                value: {
                    en: item.value_en,
                    ar: item.value_ar
                }
            }));
        } catch (error) {
            return next(new Error("❌ تنسيق tableData غير صحيح! يجب أن يكون JSON صالح.", { cause: 400 }));
        }
    }

    const updatedProduct = await HatapModel.findByIdAndUpdate(
        productId,
        {
            name1: {
                en: req.body.name1_en || product.name1?.en,
                ar: req.body.name1_ar || product.name1?.ar
            },
            name2: {
                en: req.body.name2_en || product.name2?.en,
                ar: req.body.name2_ar || product.name2?.ar
            },
            newprice: req.body.newprice || product.newprice,
            oldprice: req.body.oldprice || product.oldprice,
            description: {
                en: req.body.description_en || product.description?.en,
                ar: req.body.description_ar || product.description?.ar
            },
            quantity: {
                en: req.body.quantity_en || product.quantity?.en,
                ar: req.body.quantity_ar || product.quantity?.ar
            },
            category: req.body.categoryId || product.category,
            image: images,
            logo: logo,
            tableData: tableData,
            stoargecondition: {
                en: req.body.stoargecondition_en || product.stoargecondition?.en,
                ar: req.body.stoargecondition_ar || product.stoargecondition?.ar
            },

            // animalTypes: req.body.animalTypes ? JSON.parse(req.body.animalTypes) : product.animalTypes
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
export const cancelOrder = asyncHandelr(async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user._id;

    
    const order = await OrderModel.findById(orderId);

    if (!order) {
        return next(new Error("❌ الطلب غير موجود!", { cause: 404 }));
    }

    if (order.user.toString() !== userId.toString() && !req.user.Admin  && !req.user.Owner)  {
        return next(new Error("❌ ليس لديك صلاحية لحذف هذا الطلب!", { cause: 403 }));
    }

    //
    await OrderModel.findByIdAndDelete(orderId);

    return successresponse(res, "✅ تم حذف الطلب بنجاح!", 200);
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

    // 🟢 إشعار للأدمن
    await AdminNotificationModel.create({
        user: req.user._id,
        title: "طلب جديد",
        body: `${req.user.username} قام بعمل طلب جديد`,
    });

    // 🟡 إرسال إشعار FCM للمستخدم
    const user = await Usermodel.findById(req.user._id);
    if (user?.fcmToken) {
        await admin.messaging().send({
            notification: {
                title: "📦 تم استلام طلبك",
                body: "✅ تم إرسال الطلب بنجاح، وسيتم الرد عليك في أقرب وقت."
            },
            token: user.fcmToken
        });
    }

    return successresponse(res, "✅ تم إنشاء الطلب بنجاح!", 201);
});
 

export const getAdminNotifications = asyncHandelr(async (req, res, next) => {
    const { isRead } = req.query;

    const filter = {};
    if (isRead === "true") filter.isRead = true;
    else if (isRead === "false") filter.isRead = false;

    const notifications = await AdminNotificationModel.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "🗂️ إشعارات الأدمن",
        notifications
    });
});


export const markAllAdminNotificationsAsRead = asyncHandelr(async (req, res, next) => {
    const result = await AdminNotificationModel.updateMany(
        { isRead: false },
        { $set: { isRead: true } }
    );

    res.status(200).json({
        message: "✅ تم تعيين جميع الإشعارات كمقروءة",
        modifiedCount: result.modifiedCount
    });
});

export const markAdminNotificationAsRead = asyncHandelr(async (req, res, next) => {
    const { id } = req.params;

    const notification = await AdminNotificationModel.findById(id);
    if (!notification) {
        return next(new Error("الإشعار غير موجود", { cause: 404 }));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "✅ تم تعيين الإشعار كمقروء" });
});






// export const getAllOrders = asyncHandelr(async (req, res, next) => {
//     const orders = await OrderModel.find()
//         .populate("user", "lastName firstName email mobileNumber")
//         .populate("products.productId", "name1 newprice ");

//     return successresponse(res, "✅ جميع الطلبات!", 200, { orders });
// });






// export const createOrder = asyncHandelr(async (req, res, next) => {
//     const { products, address, phone, notes } = req.body;

//     if (!products || products.length === 0 || !address || !phone) {
//         return next(new Error("❌ جميع الحقول مطلوبة!", { cause: 400 }));
//     }

//     // التحقق هل العنوان سبق استخدامه
//     const isAddressUsed = await OrderModel.findOne({ user: req.user._id, address });

//     let message = "✅ تم إنشاء الطلب بنجاح!";
//     if (isAddressUsed) {
//         message += " 🔁 (العنوان تم استخدامه سابقًا)";
//     }

//     const newOrder = await OrderModel.create({
//         user: req.user._id,
//         products,
//         address, // ما نقدرش نشيله علشان الـ schema طالبه
//         phone,
//         notes
//     });

//     return successresponse(res, message, 201);
// });


export const getAllOrders = asyncHandelr(async (req, res, next) => {
    // Pagination params from query string (مثلاً ?page=2)
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalOrders = await OrderModel.countDocuments();

    // Get orders with pagination and sorting (الأحدث أولاً)
    const orders = await OrderModel.find()
        .sort({ createdAt: -1 }) // ترتيب تنازلي حسب وقت الإنشاء
        .skip(skip)
        .limit(limit)
        .populate("user", "lastName firstName email mobileNumber")
        .populate("products", "name1 newprice");

    // ترقيم الطلبات حسب الترتيب في الصفحة الحالية
    const numberedOrders = orders.map((order, index) => ({
        orderNumber: skip + index + 1, // رقم الطلب حسب الصفحة
        ...order._doc,
    }));

    return successresponse(res, "✅ جميع الطلبات!", 200, {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        orders: numberedOrders,
    });
});


// export const getorder= asyncHandelr(async (req, res, next) => {
   
//     const orders = await OrderModel.find({ user: req.user._id })
//         .populate("user", "lastName firstName email mobileNumber")
//         .populate("products.productId", "name1 newprice");
//     if (orders.length === 0) {
//         return next(new Error("❌ لا توجد طلبات لهذا المستخدم!", { cause: 404 }));
//     }
//     const addresses = orders.map(order => order.address);
//     return successresponse(res, "✅ جميع الطلبات!", 200, { addresses  });
// });

export const getorder = asyncHandelr(async (req, res, next) => {
    const orders = await OrderModel.find({ user: req.user._id })
        .populate("user", "lastName firstName email mobileNumber")
        .populate("products", "name1 newprice");

    if (orders.length === 0) {
        return next(new Error("❌ لا توجد طلبات لهذا المستخدم!", { cause: 404 }));
    }

    const rawAddresses = orders.map(order => order.address.trim()); // إزالة المسافات
    const uniqueAddresses = [...new Set(rawAddresses.map(addr => addr.replace(/\s+/g, ' ').trim()))];

    return successresponse(res, "✅ جميع الطلبات!", 200, { addresses: uniqueAddresses });
});



export const updateOrder = asyncHandelr(async (req, res, next) => {
    const { orderId } = req.params;

    // التحقق من وجود orderId
    if (!orderId) {
        return next(new Error("❌ يجب إدخال معرف الطلب!", { cause: 400 }));
    }

  
 

 
    const order = await OrderModel.findById(orderId);
    if (!order) {
        return next(new Error("❌ الطلب غير موجود!", { cause: 404 }));
    }

    // تحديث حقل status فقط
    const updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        {
            status: req.body.status || order.status // تحديث الحالة إذا وُجدت، وإلا تبقى كما هي
        },
        { new: true }
    )
        .populate("user", "lastName firstName email mobileNumber")
        .populate("products", "name1 newprice");

    return successresponse(res, "✅ تم تحديث الطلب بنجاح!", 200, );
});
export const cancelOrderr = asyncHandelr(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await OrderModel.findOneAndDelete({ _id: orderId, user: req.user._id });

    if (!order) {
        return next(new Error("❌ الطلب غير موجود أو لا تملك صلاحية حذفه!", { cause: 403 }));
    }

    return successresponse(res, "✅ تم حذف الطلب نهائيًا!", 200);
});


// export const sendNotificationToUser = asyncHandelr(async (req, res, next) => {
//     const { email, orderDate, orderDetails, orderStatus, orderPaid, remainingAmount, orderNumber } = req.body;

//     console.log("📩 Received Request Body:", req.body);

//     const admin = await Usermodel.findById(req.user._id);
//     console.log("👤 Admin Info:", admin);

//     if (!email) {
//         return next(new Error("❌ يجب توفير البريد الإلكتروني (email)!", { cause: 400 }));
//     }

//     // ✅ البحث عن المستخدم بناءً على الإيميل فقط
//     const user = await Usermodel.findOne({ email });

//     // ❌ التأكد من أن المستخدم موجود قبل المتابعة
//     if (!user) {
//         return next(new Error("❌ المستخدم غير موجود في النظام!", { cause: 404 }));
//     }

//     // ❌ التأكد من عدم إرسال الإشعار لنفس الشخص
//     if (user._id.toString() === admin._id.toString()) {
//         return next(new Error("❌ لا يمكنك إرسال إشعار لنفسك!", { cause: 400 }));
//     }

//     // ✅ التحقق من رفع الصورة باستخدام multer
//     if (!req.file) {
//         return next(new Error("❌ يجب رفع صورة!", { cause: 400 }));
//     }

//     // ✅ رفع الصورة إلى Cloudinary بنفس الطريقة في createCategory
//     const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `notifications/${req.user._id}` });

//     // ✅ إضافة البيانات الجديدة إلى بيانات المستخدم
//     user.notifications.push({
//         orderDate,
//         orderDetails: { en: req.body["orderDetails[en]"], ar: req.body["orderDetails[ar]"] },
//         orderStatus: { en: req.body["orderStatus[en]"], ar: req.body["orderStatus[ar]"] },
//         orderPaid,
//         remainingAmount,
//         orderNumber,
//         image: { secure_url, public_id },
//     });

//     await user.save();

//     return successresponse(res, "✅ تم إرسال البيانات بنجاح!", 200);
// });





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
    const { name1, name2, address, phone, locationLink } = req.body;

    // ✅ التحقق من صلاحيات المستخدم (يجب أن يكون Owner أو Admin)
    if (!["Owner", "Admin"].includes(req.user.role)) {
        return next(new Error("❌ ليس لديك صلاحية لإنشاء فرع!", { cause: 403 }));
    }

    // ✅ التحقق من إدخال جميع البيانات المطلوبة
    if (!name1 || !name2 || !address || !phone) {
        return next(new Error("❌ جميع الحقول مطلوبة (الاسم والعنوان باللغتين)!", { cause: 400 }));
    }

    // ✅ التحقق من أن الحقول تحتوي على الإنجليزية والعربية
    if (!name1.en || !name1.ar || !name2.en || !name2.ar || !address.en || !address.ar) {
        return next(new Error("❌ يجب إدخال جميع الحقول باللغة الإنجليزية والعربية!", { cause: 400 }));
    }

    // ✅ إنشاء الفرع الجديد
    const branch = await BranchModel.create({
        name1,
        name2,
        address,
        phone,
        locationLink
    });

    return successresponse(res, "✅ تم إنشاء الفرع بنجاح!", 201, );
});

export const getAllBranches = asyncHandelr(async (req, res, next) => {
    const branches = await dbservice.findAll({
        model: BranchModel
    });

    return successresponse(res, "✅ تم جلب جميع الفروع بنجاح!", 200, { branches: branches || [] });
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



export const createImages = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);

    
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create products.", { cause: 403 }));
    }

 
    if (!req.files || req.files.length === 0) {
        return next(new Error("❌ يجب رفع صورة واحدة على الأقل!", { cause: 400 }));
    }


    const images = await Promise.all(req.files.map(async (file) => {
        const uploadedImage = await cloud.uploader.upload(file.path, { folder: `products/${req.user._id}` });
        return { secure_url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
    }));

    const product = await AdvirtModel.create({
    
        image: images
    });

    return successresponse(res, "✅ تم رفع الصور بنجاح بواسطه مستر عبده!", 201);
});


export const deleteImage = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);

    // التأكد من أن المستخدم لديه الصلاحية لحذف الصور
    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can delete images.", { cause: 403 }));
    }

    const { imageId } = req.body; 

    if (!imageId) {
        return next(new Error("❌ يجب توفير معرف الصورة (public_id)!", { cause: 400 }));
    }

    // حذف الصورة من Cloudinary
    const result = await cloud.uploader.destroy(imageId);
    if (result.result !== "ok") {
        return next(new Error("❌ فشل في حذف الصورة من Cloudinary، تحقق من ID الصورة!", { cause: 400 }));
    }

    const record = await AdvirtModel.findOneAndUpdate(
        { "image.public_id": imageId }, 
        { $pull: { image: { public_id: imageId } } }, 
        { new: true }
    );

    if (!record) {
        return next(new Error("❌ لم يتم العثور على الصورة في قاعدة البيانات!", { cause: 404 }));
    }

    return successresponse(res, "✅ تم حذف الصورة بنجاح من Cloudinary وقاعدة البيانات!", 200);
});

export const getAllImages = asyncHandelr(async (req, res, next) => {
    console.log("Fetching all images...");


    const records = await AdvirtModel.find({}, "image");

  
    const images = records.flatMap(record => record.image);

    if (images.length === 0) {
        return next(new Error("❌ لا توجد صور متاحة!", { cause: 404 }));
    }

    return successresponse(res, "✅ تم جلب جميع الصور بنجاح!", 200, { images: images || [] });
});




export const createMix = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);

    if (!["Admin", "Owner"].includes(req.user.role)) {
        return next(new Error("Unauthorized! Only Admins or Owners can create Mix.", { cause: 403 }));
    }

    // ✅ التحقق من التكرار
    const existingMix = await mixModel.findOne({
        Mostawdaa: req.body.Mostawdaa,
        Product: req.body.Product
    });

    if (existingMix) {
        return next(new Error("❌ هذا المنتج موجود بالفعل داخل هذا المستودع!", { cause: 400 }));
    }

    const mix = await mixModel.create({
        Mostawdaa: req.body.Mostawdaa || null,
        Product: req.body.Product || null,
        newprice: req.body.newprice,
        oldprice: req.body.oldprice,
        quantity: {
            en: req.body.quantity_en,
            ar: req.body.quantity_ar
        }
    });

    return successresponse(res, "الف مبروك يا فندم تم اضافه المنتج داخل المستودع بنجاح", 201);
});



export const getProductsByMostawdaa = asyncHandelr(async (req, res, next) => {
    const { mostawdaaId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const mixes = await mixModel.find({ Mostawdaa: mostawdaaId })
        .sort({ order: 1 })
        .populate({
            path: "Product",
            select: "-__v -createdAt -updatedAt"
        })
        .populate({
            path: "Mostawdaa",
            select: "name"
        });

    // ✅ تجاهل التركيبات اللي المنتج فيها null (محذوف)
    const validMixes = mixes.filter(mix => mix.Product !== null);

    if (!validMixes.length) {
        return next(new Error("❌ لا توجد منتجات صالحة مرتبطة بهذا المستودع!", { cause: 404 }));
    }

    const totalCount = validMixes.length;
    const paginatedMixes = validMixes.slice(skip, skip + limit);

    const formattedData = paginatedMixes.map((mix, index) => ({
        index: skip + index + 1,
        _id: mix._id,
        quantity: mix.quantity,
        newprice: mix.newprice,
        oldprice: mix.oldprice,
        order: mix.order,
        Mostawdaa: mix.Mostawdaa.name,
        Product: mix.Product,
        createdAt: mix.createdAt,
        updatedAt: mix.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return successresponse(res, "✅ تم جلب المنتجات الخاصة بالمستودع!", 200, {
        mostawdaaName: validMixes[0].Mostawdaa.name,
        currentPage: page,
        totalPages,
        totalProducts: totalCount,
        products: formattedData
    });
});






export const getAllProductsWithMostawdaNames = asyncHandelr(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const { departmentId } = req.query;

    const mixes = await mixModel.find({})
        .sort({ order: 1 })
        .populate({
            path: "Product",
            match: departmentId ? { Department: departmentId } : {}, // ✅ فلترة المنتج حسب القسم
            select: "-__v -createdAt -updatedAt"
        })
        .populate({
            path: "Mostawdaa",
            select: "name _id"
        });

    // ✅ فلترة أي mix مفقود فيه المنتج أو المستودع
    const filteredMixes = mixes.filter(
        mix => mix.Product !== null && mix.Mostawdaa !== null
    );

    if (!filteredMixes.length) {
        return next(new Error("❌ لا توجد أي بيانات!", { cause: 404 }));
    }

    const productMap = new Map();

    filteredMixes.forEach((mix) => {
        const productId = mix.Product._id.toString();

        if (!productMap.has(productId)) {
            productMap.set(productId, {
                Product: mix.Product,
                Mostawdaat: new Set()
            });
        }

        productMap.get(productId).Mostawdaat.add(JSON.stringify({
            _id: mix.Mostawdaa._id,
            name: mix.Mostawdaa.name
        }));
    });

    const allProducts = Array.from(productMap.values()).map(item => ({
        Product: item.Product,
        Mostawdaat: Array.from(item.Mostawdaat).map(str => JSON.parse(str))
    }));

    const paginatedProducts = allProducts.slice(skip, skip + limit);
    const totalPages = Math.ceil(allProducts.length / limit);

    return successresponse(res, "✅ تم جلب المنتجات مع أسماء المستودعات!", 200, {
        currentPage: page,
        totalPages,
        totalProducts: allProducts.length,
        products: paginatedProducts
    });
});







export const getMostawdaasWithProducts = asyncHandelr(async (req, res, next) => {
    const result = await mixModel.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "Product",
                foreignField: "_id",
                as: "productData"
            }
        },
        {
            $lookup: {
                from: "mostawdaas",
                localField: "Mostawdaa",
                foreignField: "_id",
                as: "mostawdaaData"
            }
        },
        {
            $unwind: "$mostawdaaData"
        },
        {
            $group: {
                _id: "$Mostawdaa",
                mostawdaa: { $first: "$mostawdaaData" },
                products: {
                    $push: {
                        product: { $first: "$productData" },
                        newprice: "$newprice",
                        oldprice: "$oldprice",
                        quantity: "$quantity"
                    }
                }
            }
        }
    ]);

    return successresponse(res, "✅ تم جلب المستودعات مع المنتجات", 200, result);
});



export const getAllMostawdaas = asyncHandelr(async (req, res, next) => {
    const mostawdaas = await MostawdaaModel.find().select("-__v");

    return res.status(200).json({
        message: "✅ تم جلب جميع المستودعات",
        data: mostawdaas
    });
});


export const updateMixPriceAndQuantity = asyncHandelr(async (req, res) => {
    const { id } = req.params;
    const { newprice, quantity, oldprice } = req.body;

    const updatedMix = await mixModel.findByIdAndUpdate(
        id,
        {
            oldprice,
            newprice,
            quantity: {
                en: quantity?.en,
                ar: quantity?.ar,
            }
        },
        { new: true }
    );

    if (!updatedMix) {
        return res.status(404).json({ message: "❌ هذا العنصر غير موجود" });
    }

    return res.status(200).json({
        message: "✅ تم تعديل السعر والكمية بنجاح",
        // data: updatedMix,
    });
});



export const reorderProductInWarehouse = asyncHandelr(async (req, res, next) => {
    const { productId, mostawdaaId, newIndex } = req.body;

    if (!productId || !mostawdaaId || typeof newIndex !== "number") {
        return next(new Error("❌ يجب إرسال معرف المنتج والمستودع و الـ index الجديد!", { cause: 400 }));
    }

    // هات كل المنتجات المرتبطة بنفس المستودع
    const mixes = await mixModel.find({ Mostawdaa: mostawdaaId }).sort({ order: 1 });

    const movingIndex = mixes.findIndex(m => m.Product.toString() === productId);
    if (movingIndex === -1) {
        return next(new Error("❌ المنتج غير موجود داخل هذا المستودع!", { cause: 404 }));
    }

    const [movingMix] = mixes.splice(movingIndex, 1);
    mixes.splice(newIndex, 0, movingMix); // دخله في المكان الجديد

    // حدّث ترتيب كل المنتجات
    for (let i = 0; i < mixes.length; i++) {
        mixes[i].order = i;
        await mixes[i].save();
    }

    return successresponse(res, "✅ تم تحديث ترتيب المنتج داخل المستودع!", 200);
});




