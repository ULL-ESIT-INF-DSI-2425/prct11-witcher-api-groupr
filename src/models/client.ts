import { Document, Schema } from 'mongoose';
import { clientsDB } from '../db/mongoose.js';

export enum Race {
  WITCH = "WITCH", 
  KNIGHT = "KNIGHT", 
  NOBLE = "NOBLE",
  BANDIT = "BANDIT", 
  MERCENARY = 'MERCENARY', 
  VILLAGER = "VILLAGER"
}

export interface ClientDocumentInterface extends Document {
  name: string; 
  race: Race;
  location: string;
}

export const ClientSchema = new Schema<ClientDocumentInterface>({
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

