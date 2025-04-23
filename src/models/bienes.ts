import { Document, Schema } from 'mongoose';
import { assetsDB } from '../db/mongoose.js';


/**
 * Enum representing different types of assets.
 */
export enum AssetType {
  /** Represents a product-type asset. */
  PRODUCT = 'product',
  /** Represents an armor-type asset. */
  ARMOR = 'armor',
  /** Represents a weapon-type asset. */
  WEAPON = 'weapon',
  /** Represents a potion-type asset. */
  POTION = 'potion',
  /** Represents a book-type asset. */
  BOOK = 'book',
  /** Represents an unknown asset type. */
  UNKNOWN = 'unknown'
}

/**
 * Interface defining the structure of an asset.
 */
export interface Asset extends Document {
  /**
   * Unique identifier for the asset.
   */
  id: number;

  /**
   * Name of the asset.
   */
  name: string;

  /**
   * Description of the asset.
   */
  description: string;

  /**
   * Material from which the asset is made.
   */
  material: string;

  /**
   * Weight of the asset.
   */
  weight: number;

  /**
   * Monetary value of the asset in crowns.
   */
  crown_value: number;

  /**
   * Type of asset, based on {@link AssetType}.
   */
  type: AssetType;
}

const AssetSchema = new Schema<Asset>({
  id: {
    unique: true,
    type: Number,
    required: true,
    trim: true
    // Validar que no exista el id
  },
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Asset title must start with a capital letter');
      }
    }
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    required: true,
    trim: true
  },
  material: {
    type: String,
    required: true,
    trim: true
  },
  crown_value: {
    type: Number,
    required: true,
    trim: true,
    validate: (value: number) => {
      if ( value <= 0) {
        throw new Error('The crown value has to be more than 0');
      }
    }
  }, 
  type: {
    type: String,
    required: true, 
    trim: true,
    validate: (value: string) => {
      if (!Object.values(AssetType).includes(value as AssetType)) {
        throw new Error(`Invalid asset type: ${value}`);
      }
    }
  }
})

export const AssetModel = assetsDB.model<Asset>('AssetModel', AssetSchema)