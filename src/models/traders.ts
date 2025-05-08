import { Document, Schema, model } from 'mongoose';
// import { tradersDB } from '../db/mongoose.js';

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
  /** Name of the trader. */
  name: string;
  /** Type of trader, based on the {@link TraderTypes} enum. */
  type: TraderTypes;
  /** Location where the trader operates. */
  location: string;
}

/**
 * Schema definition for a Trader entity.
 * 
 * This schema defines the structure and validation rules for a trader in the system.
 * 
 * @property {string} name - The name of the trader. 
 * - Must be unique.
 * - Required field.
 * - Must start with a capital letter.
 * - Leading and trailing whitespace is trimmed.
 * 
 * @property {string} type - The type of the trader.
 * - Required field.
 * - Must be one of the valid values defined in the `TraderTypes` enum.
 * - Leading and trailing whitespace is trimmed.
 * 
 * @property {string} location - The location of the trader.
 * - Required field.
 * - Leading and trailing whitespace is trimmed.
 */
const TraderSchema = new Schema<Trader>({
  name: {
    unique: true,
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


export const TraderModel = model<Trader>('Trader', TraderSchema);