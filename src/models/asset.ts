import { Document, Schema, model } from 'mongoose';



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

  /**
   * Cantidad  de objetos
   */
  amount: number;
}

/**
 * Represents the schema for an Asset in the database.
 * 
 * @property name - The name of the asset. Must start with a capital letter.
 * @property description - A brief description of the asset.
 * @property weight - The weight of the asset, specified as a number.
 * @property material - The material of the asset, specified as a string.
 * @property crown_value - The monetary value of the asset in crowns. Must be greater than 0.
 * @property type - The type of the asset. Must be a valid value from the `AssetType` enum.
 * @property amount - The quantity of the asset. This field is required.
 */
const AssetSchema = new Schema<Asset>({
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
  },
  amount: {
    type: Number,
    trim: true,
    required: true // Indicating that this field is not mandatory
  }
});


export const AssetModel = model<Asset>('AssetModel', AssetSchema)