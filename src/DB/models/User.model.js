

import mongoose, { Schema, Types, model } from "mongoose";

export const roletypes = { User: "User", Admin: "Admin", Owner:"Owner"}
export const providerTypes = { system: "system", google: "google" }

const userSchema = new mongoose.Schema(
    {
      fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        phone: { type: String, required: true, trim: true },
  
        subdomain: { type: String, required: true, unique: true, trim: true },
        domain: { type: String, },
        password: { type: String, },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // email: { type: String, sparse: true, },
        // username: { type: String, unique: true, required: true },
        // password: { type: String },
        // provider: { type: String, enum: Object.values(providerTypes),default:providerTypes.system },
        
        // isDeleted: { type:Boolean, default:false},
        // firstName: { type: String },
        // lastName: { type: String },
        // city:{ type: String },

        // mobileNumber: { type: String }, 
        // role: { type: String, enum: Object.values(roletypes),  default: roletypes.User },
        isConfirmed: { type: Boolean, default: false },
        // deletedAt: { type: Date },
        // bannedAt: { type: Date },
        // isBanned: { type: Boolean, default: false },
        // otpSessionId: String,

        // updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        // Points: {
        //     type: Number,
        //     default: 0,
        // },

        // notifications: [
        //     {


        //         orderPaid: [
        //             {
        //                 amount: { type: Number },
        //                 date: { type: Date, default: Date.now }
        //             }
        //         ],
        //         remainingAmount: [
        //             {
        //                 amount: { type: Number },
        //                 date: { type: Date, default: Date.now }
        //             }
        //         ],

        //         orderDate: {
        //             type: String,
        //         },
               
        //         orderDetails: {
        //             en: { type: String, },
        //             ar: { type: String, },
        //         },
        //         orderStatus: {
        //             en: { type: String, required: true },
        //             ar: { type: String, required: true },
        //         },

        //         // orderPaid: {
        //         //     type: Number,
        //         // },
        //         ordervalue: {
        //             type: Number,
        //         },
        //         // remainingAmount: {
        //         //     type: Number,
        //         // },
        //         orderNumber: {
        //             type: Number,
        //         },
        //         image: {
        //             secure_url: { type: String,  }, // الصورة مطلوبة
        //             public_id: { type: String, }   // مهم لحذف الصور من Cloudinary
        //         },
        //     }
        // ],
        
        // fcmToken: { type: String, default: null },



        emailOTP: String,
        forgetpasswordOTP: String,
        attemptCount: Number,
        otpExpiresAt: Date,
        blockUntil: {
            type: Date,
        },

     
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },  
        toObject: { virtuals: true } 
     }
);


// userSchema.virtual("username").set(function (value) {
//     console.log({value});
    
//     this.firstName = value.split(" ")[0]
//     this.lastName = value.split(" ")[1]
// }).get(function () {
//     return this.firstName + " " + this.lastName
// })

const Usermodel = mongoose.model("User", userSchema);
export default Usermodel;
export const scketConnections = new Map()
export const onlineUsers = new Map();



