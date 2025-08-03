import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { OTPDoc } from "../types";



const otpSchema = new Schema<OTPDoc>({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120,
    },
});

otpSchema.pre("save", async function (next) {
    if (this.isModified("otp")) {
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
    }
    next();
});

otpSchema.methods.compareOTP = async function (candidateOTP: string) {
    return await bcrypt.compare(candidateOTP, this.otp);
};

export default mongoose.model<OTPDoc>("OTPModel", otpSchema);
