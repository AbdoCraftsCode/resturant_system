
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, default: 1 }
            }
        ],
        address: { type: String, required: true },
        phone: { type: String, required: true },
        notes: { type: String },
        paidAmount: { type: Number, default: 0 },
        status: { type: String, default: "waiting" },
    },
  
    { timestamps: true }
);

export const OrderModel = mongoose.model("Order", orderSchema);
