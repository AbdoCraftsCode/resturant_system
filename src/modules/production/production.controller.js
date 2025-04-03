import { Router } from "express";
import { authentication, authorization } from "../../middlewere/authontcation.middlewere.js";
import { fileValidationTypes, uploadCloudFile } from "../../utlis/multer/cloud.multer.js";
import { endpoint } from "./production.authrize.js";
import { cancelOrder, createAdminByOwner, createBranch, createImages, createOrder, createProduct, deleteAdminByOwner, deleteBranch, deleteImage, deleteProduct, deleteProductImage, getAllAdmins, getAllBranches, getAllImages, getAllOrders, getorder, getProducts, getProductswithout, searchUsersByName,  updateAdminByOwner, updateOrder, updateProduct } from "./service/production.service.js";

const router = Router()


router.post("/createProduct",
    authentication(),
    authorization(endpoint.create),
    uploadCloudFile(fileValidationTypes.image).array("image", 3),
   createProduct
)
router.post("/createImages/admin",
    authentication(),
    authorization(endpoint.create),
    uploadCloudFile(fileValidationTypes.image).array("image", 3),
    createImages
)

router.post("/getProducts", getProducts)
   
router.patch("/updateOrder/:orderId", authentication(),updateOrder)
router.get("/getAllImages", getAllImages)
router.get("/getorder", authentication(),getorder)
router.post("/getProductswithout", getProductswithout)
router.get("/getAllBranches/admin", getAllBranches)
router.get("/getAllAdmins/admin", getAllAdmins)
router.get("/getAllOrders", getAllOrders)
router.get("/searchUsersByName/admin", searchUsersByName)
router.delete("/deleteAdminByOwner/:adminId/admin", authentication(), deleteAdminByOwner)
router.delete("/deleteBranch/:branchId/admin", authentication(),authorization(endpoint.delete) ,deleteBranch)
router.post("/createOrder", authentication(), createOrder)
router.post("/createAdminByOwner/admin", authentication(), createAdminByOwner)
router.post("/createBranch/admin", authentication(), authorization(endpoint.create),createBranch)
router.patch("/updateAdminByOwner/:adminId/admin", authentication(), updateAdminByOwner)
// router.post("/sendNotificationToUser/admin",
//     authentication(),
//     authorization(endpoint.create),
//     uploadCloudFile(fileValidationTypes.image).array("image", 3),
//     sendNotificationToUser)


router.patch("/updateProduct/:productId",
    authentication(),
    authorization(endpoint.update),
    uploadCloudFile(fileValidationTypes.image).array("image", 3),
    updateProduct
)
router.delete("/cancelOrder/:orderId", authentication(), cancelOrder)
router.delete("/deleteImage/admin", authentication(), deleteImage)
router.delete("/deleteProductImage", authentication(),authorization(endpoint.delete),deleteProductImage)
router.delete("/deleteProduct/:productId",authentication(),authorization(endpoint.delete),deleteProduct)



export default router