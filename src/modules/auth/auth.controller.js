import { Router } from "express";
import { validation } from "../../middlewere/validation.middlewere.js";
import  * as validators from "../auth/auth.validate.js"
import { confirmOTP, createBranch, createMainGroup, createSubGroup, deleteBranch, deleteMainGroup, deleteSubGroup, getBranches, getMainGroupsForUser, getMainGroupsWithSubGroups, registerRestaurant, sendotpphone, signup, signupwithGmail, updateBranch, updateMainGroup, updateSubGroup } from "./service/regestration.service.js";
import { deleteMyAccount, forgetpassword,   forgetPasswordphone,   forgetPasswordphoneadmin,   login, loginRestaurant, loginwithGmail, refreshToken, resendOTP, resetpassword, resetPasswordphone, verifyOTP } from "./service/authontecation.service.js";
import { authentication } from "../../middlewere/authontcation.middlewere.js";

const routr = Router()



import axios from "axios";
import dotenv from "dotenv";

dotenv.config();






routr.post("/signup", signup)
routr.post("/registerRestaurant", registerRestaurant)
routr.post("/verifyOTP", verifyOTP)

routr.post("/login", login)
routr.post("/createBranch", authentication(),createBranch)
routr.post("/loginRestaurant", loginRestaurant)
routr.post("/resendOTP",resendOTP )
routr.post("/resetpassword", resetpassword)
routr.patch("/resetPasswordphone", resetPasswordphone)
routr.post("/signupwithGmail", signupwithGmail)
// routr.post("/confirmOTP", confirmOTP)
routr.post("/sendotpphone", sendotpphone)
routr.post("/confirmOTP", confirmOTP)
routr.post("/getBranches", authentication(), getBranches)
routr.get("/getMainGroupsForUser", authentication(), getMainGroupsForUser)

routr.get("/getMainGroupsWithSubGroups", authentication(), getMainGroupsWithSubGroups)

routr.delete("/deleteBranch/:id", authentication(), deleteBranch)
routr.put("/updateBranch/:id", authentication(), updateBranch)
routr.post("/refreshToken", refreshToken)
routr.post("/createMainGroup", authentication(), createMainGroup)
routr.post("/createSubGroup", authentication(), createSubGroup)
routr.post("/forgetpassword", forgetpassword)
routr.post("/forgetpasswordphone", forgetPasswordphone)
routr.post("/forgetPasswordphoneadmin", forgetPasswordphoneadmin)
routr.post("/loginwithGmail", loginwithGmail)
routr.delete("/deleteMyAccount", authentication(), deleteMyAccount)
routr.delete("/deleteMainGroup/:id", authentication(), deleteMainGroup)
routr.delete("/deleteSubGroup/:id", authentication(), deleteSubGroup)
routr.patch("/updateMainGroup/:id", authentication(), updateMainGroup)
routr.patch("/updateSubGroup/:id", authentication(), updateSubGroup)

export default routr