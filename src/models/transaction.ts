import {Document,  Schema} from 'mongoose'
import { transactionsDB } from '../db/mongoose.js'
import { Trader, TraderModel} from './traders.js'
import { Asset , AssetModel} from './asset.js'
import {Types} from 'mongoose'

export interface TransactionDocumentInterface extends Document {
  mercader: string,
  bienes: Bien[],
  date: Date,
  crownValue: number,
  innBuying?: boolean
}

export interface Bien {
  asset: string,
  amount: Number
}

export const TransactionSquema = new Schema<TransactionDocumentInterface>({
  mercader: {
    type: String,
    ref: 'TraderModel',
    required: true
  },
  bienes: {
    required: true,
    type: [{
      asset: {
        type: String,
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

export const Transaction = transactionsDB.model<TransactionDocumentInterface>('Transaction', TransactionSquema)