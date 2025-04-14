

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name1: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        name2: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
     

        country: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        animalTypes: [{ type: String, trim: true }],

        stoargecondition: {
            en: { type: String, },
            ar: { type: String, }


        },


        tableData: [{
            name: {
                en: { type: String, required: true, trim: true },
                ar: { type: String, required: true, trim: true }
            },
            value: {
                en: { type: String, required: true, trim: true },
                ar: { type: String, required: true, trim: true }
            }
        }],
    
    

      
        newprice: { type: Number, },
        oldprice: { type: Number,  },
        description: {
            en: { type: String, required: true },
            ar: { type: String, required: true }
        },
        quantity: {
            en: { type: String, required: true, trim: true },
            ar: { type: String, required: true, trim: true }
        },
        image:[{
            secure_url: { type: String },
            public_id: { type: String },
        }],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
      
        },
        Department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }


    },
    { timestamps: true }
);

export const ProductModel = mongoose.model("Product", productSchema);




