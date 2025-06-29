import { Router } from "express";
import { validation } from "../../middlewere/validation.middlewere.js";
import  * as validators from "../auth/auth.validate.js"
import {  sendotpphone, signup, signupwithGmail } from "./service/regestration.service.js";
import { deleteMyAccount, forgetpassword,   forgetPasswordphone,   forgetPasswordphoneadmin,   login, loginwithGmail, refreshToken, resendOTP, resetpassword, resetPasswordphone, verifyOTP } from "./service/authontecation.service.js";
import { authentication } from "../../middlewere/authontcation.middlewere.js";

const routr = Router()



import axios from "axios";
import dotenv from "dotenv";

dotenv.config();






routr.post("/signup", signup)
routr.post("/verifyOTP", verifyOTP)

routr.post("/login", login)
routr.post("/resendOTP",resendOTP )
routr.post("/resetpassword", resetpassword)
routr.patch("/resetPasswordphone", resetPasswordphone)
routr.post("/signupwithGmail", signupwithGmail)
// routr.post("/confirmOTP", confirmOTP)
routr.post("/sendotpphone", sendotpphone)
routr.post("/refreshToken",refreshToken)
routr.post("/forgetpassword", forgetpassword)
routr.post("/forgetpasswordphone", forgetPasswordphone)
routr.post("/forgetPasswordphoneadmin", forgetPasswordphoneadmin)
routr.post("/loginwithGmail", loginwithGmail)
routr.delete("/deleteMyAccount", authentication(), deleteMyAccount)

export default routr