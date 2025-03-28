import { Router } from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "./service/category.service.js";
import { fileValidationTypes, uploadCloudFile } from "../../utlis/multer/cloud.multer.js";
import { authentication, authorization } from "../../middlewere/authontcation.middlewere.js";
import { endpoint } from "./category.authrize.js";
const router = Router()


router.post("/createCategory",
    authentication(),
    authorization(endpoint.create),
    uploadCloudFile(fileValidationTypes.image).single("image"),
   createCategory
)

router.patch("/updateCategory/:categoryId",
    authentication(),
    authorization(endpoint.update),
    uploadCloudFile(fileValidationTypes.image).single("image"),
    updateCategory
)
router.delete("/deleteCategory/:categoryId",
    authentication(),
    authorization(endpoint.delete),
    uploadCloudFile(fileValidationTypes.image).single("image"),
    deleteCategory
)



router.post("/getCategory" , getCategories)


export default router