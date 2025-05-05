import {Document,  Schema} from 'mongoose'
import { transactionsDB } from '../db/mongoose.js'
import { Trader, TraderModel} from './traders.js'
import { Asset , AssetModel} from './bienes.js'

export interface TransactionDocumentInterface extends Document {
  mercader: Trader,
  bienes: Asset[],
  date: Date,
  crownValue: number,
  innBuying?: boolean
}

export type bienes = [Asset, Number][]

export const TransactionSquema = new Schema<TransactionDocumentInterface>({
  mercader: {
    type: Schema.Types.ObjectId,
    ref: 'TraderModel',
    required: true,
    validate: async (trader: Trader) => {
      const searchedTrader = await TraderModel.findById(trader._id)
      if (!searchedTrader) {
        throw new Error('The trader must be registered on the database')
      }
    }
  },
  bienes: {
    required: true,
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'AssetModel'
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