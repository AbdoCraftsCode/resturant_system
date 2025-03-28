import { roletypes } from "../DB/models/User.model.js";
import { asyncHandelr } from "../utlis/response/error.response.js";
import {  decodedToken } from "../utlis/security/Token.security.js";



export const authentication = () => {
    return asyncHandelr(async (req, res, next) => {
        req.user = await decodedToken({ authorization: req.headers.authorization, next });
        return next();
    });
};



export const authorization = (roletypes) => {
    return asyncHandelr(async (req, res, next) => {
        if (!roletypes.includes(req.user.role)) {

            return next(new Error("invalid authorization", { cause: 400 }));


        }


        return next();
    });
};