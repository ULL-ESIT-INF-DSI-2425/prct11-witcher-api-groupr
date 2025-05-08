import {Document,  ObjectId,  Schema, model} from 'mongoose'
import { Asset } from './asset.js'
import {Types} from 'mongoose'

/**
 * Interface representing a transaction document stored in MongoDB.
 *
 * @property mercader - Reference to the trader (foreign key to TraderModel)
 * @property bienes - List of goods/assets involved in the transaction
 * @property date - The date the transaction occurred
 * @property crownValue - Total value of the transaction in crown currency
 * @property innBuying - Optional flag indicating if the transaction happened at an inn
 */
export interface TransactionDocumentInterface extends Document {
  mercader: ObjectId,
  bienes: Bien[],
  date: Date,
  crownValue: number,
  innBuying?: boolean
}

/**
 * Interface representing a single good involved in a transaction.
 *
 * @property asset - Reference to the asset (foreign key to AssetModel)
 * @property amount - Amount of the asset traded
 */
export interface Bien {
  asset: ObjectId,
  amount: Number
}

/**
 * Schema definition for a Transaction document in the database.
 * 
 * This schema defines the structure of a transaction, including the trader involved,
 * the list of assets being exchanged, the date of the transaction, its total crown value,
 * and whether it took place at an inn.
 * 
 * @constant
 * @type {Schema<TransactionDocumentInterface>}
 * 
 * @property {ObjectId} mercader - Reference to the trader who made the transaction. This field is required and must match a document from the `TraderModel`.
 * 
 * @property {Bien[]} bienes - Array of goods involved in the transaction. Each item must include:
 * - `asset`: ObjectId referring to an asset from `AssetModel`. Required.
 * - `amount`: Number indicating the quantity of the asset. Required.
 * At least one asset must be present in the array.
 * 
 * @property {Date} date - The date when the transaction occurred. This field is required and trimmed. Future dates are not allowed.
 * 
 * @property {number} crownValue - Total value of the transaction in crowns. This field is required.
 * 
 * @property {boolean} innBuying - Indicates whether the transaction took place at an inn. This field is required.
 */
export const TransactionSquema = new Schema<TransactionDocumentInterface>({
  mercader: {
    type: Types.ObjectId,
    ref: 'TraderModel',
    required: true
  },
  bienes: {
    required: true,
    type: [{
      asset: {
        type: Types.ObjectId,
        ref: 'AssetModel',
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    validate: (bienes: Asset[]) => {
      if (bienes.length <= 0) {
        throw new Error('There must be at least 1 asset involved')
      }
    }
  },
  date: {
    type: Date,
    trim: true,
    required: true,
    validate: (date: Date) => {
      if (date > new Date()) {
        throw new Error('A transaction can`t have a future date')
      }
    }
  },
  crownValue: {
    type: Number, 
    required: true,
  },
  innBuying: {
    type: Boolean,
    required: true,
  }
})

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSquema)
