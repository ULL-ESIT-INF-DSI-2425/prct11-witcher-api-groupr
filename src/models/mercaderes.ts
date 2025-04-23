import { Document, Schema } from 'mongoose';
import { tradersDB } from '../db/mongoose.js';

/**
 * Enum representing different types of traders.
 */
export enum TraderTypes {
  /** A blacksmith who forges and sells metal goods. */
  Blacksmith = "blacksmith",
  /** An alchemist who sells potions and magical substances. */
  Alchemist = "alchemist",
  /** A general trader who deals in various goods. */
  Generaltrader = "generaltrader",
  /** A herbalist who specializes in selling herbs and natural remedies. */
  Herbalist = "herbalist",
  /** An armorer who crafts and sells armor. */
  Armorer = "armored"
}

/**
 * Interface representing a trader.
 */
export interface Trader extends Document {
  /** Unique identifier for the trader. */
  id: number;
  /** Name of the trader. */
  name: string;
  /** Type of trader, based on the {@link TraderTypes} enum. */
  type: TraderTypes;
  /** Location where the trader operates. */
  location: string;
}

const TraderSchema = new Schema<Trader>({
  id: {
    unique: true,
    type: Number,
    required: true,
    trim: true,
    //validar si el id existe
  },
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Trader name must start with a capital letter');
      }
    }
  },
  type: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!Object.values(TraderTypes).includes(value as TraderTypes)) {
        throw new Error(`Invalid trader type: ${value}`);
      }
    }
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
})

export const TraderModel = tradersDB.model<Trader>('Trader', TraderSchema);