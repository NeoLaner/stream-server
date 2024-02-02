import validator from "validator";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserDataApi } from "../utils/@types/index";

interface Methods {
  changePasswordAfter(JWTTimeStamp: number): boolean;
}

const userSchema = new mongoose.Schema<UserDataApi & Methods>({
  name: {
    type: String,
    required: [true, "Please tell us your name."],
  },
  userId: {
    type: String,
    lowercase: true,
    required: [true, "Please give an unique an id."],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email address."],
    unique: true,
    lowercase: true,
    validate: [
      function (val: string) {
        return validator.isEmail(val, {
          allow_display_name: false,
          require_display_name: false,
          allow_utf8_local_part: true,
          require_tld: true,
          allow_ip_domain: false,
          domain_specific_validation: true,
          blacklisted_chars: "",
          host_blacklist: ["hotmail.com"],
        });
      },
      "Please provide a valid email address.",
    ],
  },

  role: {
    type: String,
    enum: ["user", "guest", "admin"],
    default: "user",
  },

  photo: {
    type: String,
    default: "default.jpg",
  },

  password: {
    type: String,
    required: [true, "password"],
    minlength: [
      8,
      "Please provide a password which has at least 8 characters.",
    ],
    select: false,
  },

  passwordChangedAt: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  // aboutUser: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: AboutUser,
  // },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified

  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.changePasswordAfter = function (
  this: UserDataApi,
  JWTTimeStamp: number
) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = this.passwordChangedAt.getTime() / 1000;
    return passwordChangedAt > JWTTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
