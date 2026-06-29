import mongoose, { Schema, type Model } from "mongoose"

export interface SongRequestDocument {
  songRequest: string
  requestedBy?: string
  dedicatedTo?: string
  username?: string
  played: boolean
  createdAt: Date
  updatedAt: Date
}

const songRequestSchema = new Schema<SongRequestDocument>(
  {
    songRequest: {
      type: String,
      required: true,
      trim: true,
    },
    requestedBy: {
      type: String,
      trim: true,
    },
    dedicatedTo: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    played: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const SongRequestModel: Model<SongRequestDocument> =
  mongoose.models.SongRequest ||
  mongoose.model<SongRequestDocument>("SongRequest", songRequestSchema)

export default SongRequestModel
