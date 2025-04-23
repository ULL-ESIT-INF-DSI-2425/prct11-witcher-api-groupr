import { Document, Schema } from 'mongoose';
import { clientsDB } from '../db/mongoose.js';

export enum Race {
  WITCH = "WITCH", 
  KNIGHT = "KNIGHT", // Corregí "KNIGTH" a "KNIGHT"
  NOBLE = "NOBLE",
  BANDIT = "BANDIT", 
  MERCENARY = 'MERCENARY', 
  VILLAGER = "VILLAGER"
}

export interface ClientDocumentInterface extends Document {
  id: number;
  name: string; 
  race: Race;
  location: string;
}

export const ClientSchema = new Schema<ClientDocumentInterface>({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
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

export const Client = clientsDB.model<ClientDocumentInterface>('Client', ClientSchema)

