import { Document, Schema, model } from 'mongoose';

/**
 * Enum representing the different races of hunters.
 * 
 * @enum {string}
 * @property {string} WITCH - Represents a witch race.
 * @property {string} KNIGHT - Represents a knight race.
 * @property {string} NOBLE - Represents a noble race.
 * @property {string} BANDIT - Represents a bandit race.
 * @property {string} MERCENARY - Represents a mercenary race.
 * @property {string} VILLAGER - Represents a villager race.
 */
export enum Race {
  WITCH = "WITCH", 
  KNIGHT = "KNIGHT", 
  NOBLE = "NOBLE",
  BANDIT = "BANDIT", 
  MERCENARY = 'MERCENARY', 
  VILLAGER = "VILLAGER"
}

/**
 * Interface representing a Hunter document.
 * Extends the base `Document` interface.
 *
 * @interface HunterDocumentInterface
 * @extends {Document}
 * 
 * @property {string} name - The name of the hunter.
 * @property {Race} race - The race of the hunter.
 * @property {string} location - The current location of the hunter.
 */
export interface HunterDocumentInterface extends Document {
  name: string; 
  race: Race;
  location: string;
}

/**
 * Schema definition for a Hunter document in the database.
 * 
 * This schema defines the structure of a hunter, including their name, race, and location.
 * 
 * @constant
 * @type {Schema<HunterDocumentInterface>}
 * 
 * @property {string} name - The name of the hunter. This field is required and will be trimmed of any extra whitespace.
 * @property {string} race - The race of the hunter. This field is required and must be one of the values defined in the `Race` enum.
 * @property {string} location - The current location of the hunter. This field is required and will be trimmed of any extra whitespace.
 */
export const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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


export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema)

