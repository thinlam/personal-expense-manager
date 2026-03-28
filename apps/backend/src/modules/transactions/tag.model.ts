import { Schema, model, Types } from "mongoose";

const tagSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

export const TagModel = model("Tag", tagSchema);
export type TagDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
};
