import mongoose from "mongoose";

const { Schema } = mongoose;

const TamagotchiSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    level: { type: Number, default: 1 },
    hunger: { type: Number, default: 100, min: 0, max: 100 },
    hygiene: { type: Number, default: 100, min: 0, max: 100 },
    energy: { type: Number, default: 100, min: 0, max: 100 },
    fun: { type: Number, default: 100, min: 0, max: 100 },
    poopsCount: { type: Number, default: 0, min: 0 },
    gamesCount: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [lng, lat]
      },
    },
  },
  { timestamps: true },
);

TamagotchiSchema.index({ location: "2dsphere" });

export default mongoose.model("Tamagotchi", TamagotchiSchema);