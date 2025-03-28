import { CategoryModel } from "../../../DB/models/Category.model.js";

import cloud from "../../../utlis/multer/cloudinary.js";
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { successresponse } from "../../../utlis/response/success.response.js";

import * as dbservice from "../../../DB/dbservice.js"

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



