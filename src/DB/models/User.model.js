

import mongoose, { Schema, Types, model } from "mongoose";

export const roletypes = { User: "User", Admin: "Admin", Owner:"Owner"}
export const providerTypes = { system: "system", google: "google" }

const userSchema = new mongoose.Schema(
    {

        email: { type: String, unique: true, required: true },
        password: { type: String },
        provider: { type: String, enum: Object.values(providerTypes),default:providerTypes.system },
        
        isDeleted: { type:Boolean, default:false},
        firstName: { type: String },
        lastName: { type: String },
        city:{ type: String },

        mobileNumber: { type: String },
        role: { type: String, enum: Object.values(roletypes),  default: roletypes.User },
        isConfirmed: { type: Boolean, default: false },
        deletedAt: { type: Date },
        bannedAt: { type: Date },
        isBanned: { type: Boolean, default: false },
    
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
       

        notifications: [
            {
                title: {
                    en: { type: String, required: true },  
                    ar: { type: String, required: true },  
                },
                message: {
                    en: { type: String, required: true },  
                    ar: { type: String, required: true }  
                },
                createdAt: { type: Date, default: Date.now } 
            }
        ],
   
      
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


userSchema.virtual("username").set(function (value) {
    console.log({value});
    
    this.firstName = value.split(" ")[0]
    this.lastName = value.split(" ")[1]
}).get(function () {
    return this.firstName + " " + this.lastName
})

const Usermodel = mongoose.model("User", userSchema);
export default Usermodel;
export const scketConnections = new Map()
export const onlineUsers = new Map();



