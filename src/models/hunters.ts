import { Document, Schema } from 'mongoose';
import { huntersDB } from '../db/mongoose.js';

export enum Race {
  WITCH = "WITCH", 
  KNIGHT = "KNIGHT", 
  NOBLE = "NOBLE",
  BANDIT = "BANDIT", 
  MERCENARY = 'MERCENARY', 
  VILLAGER = "VILLAGER"
}

export interface HunterDocumentInterface extends Document {
  name: string; 
  race: Race;
  location: string;
}

export const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  race: {
    type: String,
    enum: Object.values(Race),
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
});

export const Hunter = huntersDB.model<HunterDocumentInterface>('Hunter', HunterSchema)

