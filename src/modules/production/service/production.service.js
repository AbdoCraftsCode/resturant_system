import * as dbservice from "../../../DB/dbservice.js"
import { AdvirtModel } from "../../../DB/models/advertise.model.js";
import { BranchModel } from "../../../DB/models/branch.model.js";
import { CategoryModel } from "../../../DB/models/Category.model.js";
import { mixModel } from "../../../DB/models/mix.model.js";
import { MostawdaaModel } from "../../../DB/models/mostoda3.model.js";

import { OrderModel } from "../../../DB/models/order.model.js";
import { ProductModel } from "../../../DB/models/product.model.js";
import Usermodel from "../../../DB/models/User.model.js";

import cloud from "../../../utlis/multer/cloudinary.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import bcrypt from "bcrypt"














export const createProduct = asyncHandelr(async (req, res, next) => {
    console.log("User Data:", req.user);
    console.log("User Data:", req.body);
    // التأكد من أن المستخدم لديه الصلاحية لإضافة منتج
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

   
    let tableData = [];
    if (req.body.tableData) {
        try {
            tableData = JSON.parse(req.body.tableData);
        } catch (error) {
            return next(new Error("❌ تنسيق tableData غير صحيح! يجب أن يكون JSON صالح.", { cause: 400 }));
        }
    } 

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
        // newprice: req.body.newprice,
        // oldprice: req.body.oldprice,
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
        // category: req.body.categoryId,
        Department: req.body.departmentId,
        createdBy: req.user._id,
        image: images,
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
            "animalTypes"
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

    // معالجة tableData مع تسجيل للتحقق
    let tableData = product.tableData; // القيمة الافتراضية هي القديمة
    if (req.body.tableData) {
        try {
            console.log("Raw tableData from req.body:", req.body.tableData);
            const parsedTableData = JSON.parse(req.body.tableData);
            console.log("Parsed tableData:", parsedTableData);
            // تحويل البيانات إلى الهيكل المتوقع في السكيما
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
            console.log("Formatted tableData for MongoDB:", tableData);
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

    return successresponse(res, "✅ تم إنشاء الطلب بنجاح!", 201);
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
        .populate("products.productId", "name1 newprice");

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
        .populate("products.productId", "name1 newprice");

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
        .populate("products.productId", "name1 newprice");

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

    return successresponse(res, "Mix created successfully!", 201,);
});



export const getProductsByMostawdaa = asyncHandelr(async (req, res, next) => {
    const { mostawdaaId } = req.params;

    const mixes = await mixModel.find({ Mostawdaa: mostawdaaId })
        .populate({
            path: "Product",
            select: "-__v -createdAt -updatedAt" // كل التفاصيل ما عدا البيانات الغير ضرورية
        })
        .populate({
            path: "Mostawdaa",
            select: "name" // اسم المستودع فقط
        })
        .exec();

    if (!mixes.length) {
        return next(new Error("❌ لا توجد منتجات مرتبطة بهذا المستودع!", { cause: 404 }));
    }

    // ترتيب البيانات بشكل منسق
    const formattedData = mixes.map((mix) => ({
        _id: mix._id,
        quantity: mix.quantity,
        newprice: mix.newprice,
        oldprice: mix.oldprice,
        Mostawdaa: mix.Mostawdaa.name, // اسم المستودع
        Product: mix.Product, // كل تفاصيل المنتج
        createdAt: mix.createdAt,
        updatedAt: mix.updatedAt,
    }));

    return successresponse(res, "✅ تم جلب المنتجات الخاصة بالمستودع!", 200, {
        mostawdaaName: mixes[0].Mostawdaa.name,
        products: formattedData
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





