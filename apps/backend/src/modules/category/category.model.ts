import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    icon: {
      type: String,
      default: "📁",
    },

    color: {
      type: String,
      default: "#3b82f6",
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* 🚀 Không cho trùng name + type */
categorySchema.index(
  { name: 1, type: 1, parentId: 1 },
  { unique: true }
);

export default mongoose.model("Category", categorySchema);