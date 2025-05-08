import express from 'express';
import '../db/mongoose.js';
import { Transaction, TransactionDocumentInterface, Bien} from '../models/transaction.js';
import { TraderModel } from '../models/traders.js';
import { Hunter } from '../models/hunters.js';
import { AssetModel } from '../models/asset.js';
import { exit } from 'process';

export const transactionApp = express.Router()

transactionApp.use(express.json())


/**
 * GET /transactions endpoint.
 * 
 * Retrieves a list of transactions based on a trader/hunter's name or a date range.
 * 
 * - If `name` is provided, it searches for transactions involving the trader or hunter with that name.
 * - If `firstDay` and `lastDay` are provided, it filters transactions by date.
 * 
 * @route GET /transactions
 * @queryParam {string} [name] - The name of the trader or hunter.
 * @queryParam {string} [firstDay] - The minimum transaction date (ISO format).
 * @queryParam {string} [lastDay] - The maximum transaction date (ISO format).
 * @returns {Transaction[]} 200 - A list of transactions.
 * @returns {string} 400 - If name or date parameters are missing.
 * @returns {string} 404 - If no transactions are found.
 * @returns {Error} 500 - Server error.
 */
transactionApp.get('/transactions', async (req, res) => {
  if (!req.query.name && !req.query.firstDay) {
    res.status(400).send('A trader Name or a date must be provided')
  }
  else if (req.query.name) {
    try {
      const searchedTrader = await TraderModel.find({name: req.query.name})
      const searchedHunter = await Hunter.find({name: req.query.name})
      if (searchedTrader.length === 0 && searchedHunter.length === 0) {
        res.status(404).send(`Trader with name ${req.query.name} not found`)
      } else {
        if (searchedTrader.length > 0) {
          const transaction = await Transaction.find({mercader: searchedTrader[0]._id})
          if (!transaction) {
            res.status(404).send(`Trader with name ${req.query.name} not found`)
          }
          else {
            res.status(200).send(transaction)
          }
        } else {
          const transaction = await Transaction.find({mercader: searchedHunter[0]._id})
          if (!transaction) {
            res.status(404).send(`Trader with name ${req.query.name} not found`)
          }
          else {
            res.status(200).send(transaction)
          }
        }
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
  else {
    if (!req.query.lastDay) {
      res.status(400).send('A maximun date must be provided')
    }
    try {
      const minDay = new Date(req.query.firstDay as string)
      const maxDay = new Date(req.query.lastDay as string)
      const transaction = await Transaction.find({date: {$lte: maxDay, $gte: minDay}})
      if (!transaction) {
        res.status(404).send('Error: transaction not found')
      }
      else {
        res.status(200).send(transaction)
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})

/**
 * GET /transactions/:id endpoint.
 * 
 * Retrieves a single transaction by its ID.
 * 
 * @route GET /transactions/:id
 * @param {string} id - The ID of the transaction to retrieve.
 * @returns {Transaction} 200 - The found transaction.
 * @returns {string} 404 - If the transaction is not found.
 * @returns {Error} 500 - Server error.
 */
transactionApp.get('/transactions/:id', async(req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      res.status(404).send(`Transaction with id ${req.params.id} not found`)
    }
  }
  catch(err) {
    res.status(500).send(err)
  }
})


/**
 * POST /transactions endpoint.
 * 
 * Creates a new transaction. Validates that the trader and assets exist, then saves the transaction.
 * Also updates the asset stock.
 * 
 * @route POST /transactions
 * @bodyParam {Transaction} transaction - The transaction object including trader, assets, etc.
 * @returns {Transaction} 201 - The created transaction.
 * @returns {string} 400 - If required fields are missing or validation fails.
 * @returns {Error} 500 - Server error.
 */
transactionApp.post('/transactions', async(req, res) => {
  if (!req.body || !req.body.mercader || !req.body.bienes) {
    res.status(400).send('Error: a body must be specified')
  }
  else {
    try {
      // comrpobar que los bienes y mercaderes existan
      const check = await checkDB(req.body)
      if (check) {
        let transaction = new Transaction(req.body)
        //registramos la transación
        transaction = await transaction.save()
        // //actualizamos el stock disponible de cada bien
        const update = await updateStock(req.body)
        if (!update) {
          res.status(500).send('Error: stock not updated')
        }
        res.status(201).send(transaction)
      } else {
        res.status(400).send('Error: a trader and a colection of assets must be provided')
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})


/**
 * PATCH /transactions/:id endpoint.
 * 
 * Updates an existing transaction by ID. Checks for valid changes before applying them.
 * 
 * @route PATCH /transactions/:id
 * @param {string} id - The ID of the transaction to update.
 * @bodyParam {Partial<Transaction>} changes - The updated fields for the transaction.
 * @returns {Transaction} 201 - The modified transaction.
 * @returns {string} 400 - If the body is invalid or updates are not allowed.
 * @returns {string} 404 - If the transaction does not exist.
 * @returns {Error} 500 - Server error.
 */
transactionApp.patch('/transactions/:id', async(req, res) => {
  try {
    const searchedTransaction = await Transaction.findById(req.params.id)
    if (!searchedTransaction) {
      res.status(404).send(`Error: Transaction wiht ID ${req.params.id} not found`)
    }
    else if (!req.body) {
      res.status(400).send('Error: body not provided')
    }
    else {
      const update = await checkChanges(req.body, searchedTransaction)
      if (!update) {
        res.status(400).send('Error: a trader and a colection of assets must be provided')
      }
      const modifiedTransaction = await Transaction.findByIdAndUpdate(req.body)
      if (!modifiedTransaction) {
        res.status(404).send(`Error: Transaction with ID ${req.params.id} not found`)
      }
      else {
        res.status(201).send(modifiedTransaction)
      }
      
    }
  }
  catch(err) {

  }
})

/**
 * DELETE /transactions/:id endpoint.
 * 
 * Deletes a transaction by ID and restores the stock for the involved assets.
 * 
 * @route DELETE /transactions/:id
 * @param {string} id - The ID of the transaction to delete.
 * @returns {Transaction} 200 - The deleted transaction.
 * @returns {string} 400 - If the ID is missing.
 * @returns {string} 404 - If the transaction does not exist.
 * @returns {Error} 500 - Server error.
 */
transactionApp.delete('/transactions/:id', async(req, res) => {
  if (!req.params.id) {
    res.status(400).send('Error: a transaction id must be provided')
  }
  else {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.params.id)
      if (!transaction) {
        res.status(404).send(`Transaction with id ${req.params.id} not found`)
      }
      else {
        //actualizamos el stock de los bienes
        updateStock(transaction, true)
        res.status(200).send(transaction)
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }

})

/**
 * Validates proposed changes to a transaction.
 * 
 * Ensures that the updated transaction contains valid trader/hunter, date, and crown value.
 * It may reject updates if constraints are not met.
 * 
 * @param {Partial<Transaction>} changes - The proposed modifications to the transaction.
 * @param {TransactionDocumentInterface} transaction - The current transaction to compare against.
 * @returns {Promise<boolean>} - Resolves true if the changes are valid, otherwise rejects with an error message.
 */

export const checkChanges = (changes, transaction: TransactionDocumentInterface): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      if ("innBuying" in changes) { // comprobamos si se va a modificar de compra a venta o viceversa
        // transaction.innBuying = changes.innBuying // modificamos el valor de la transacción
        console.log('transaction.innBuying', transaction.innBuying)
      }
      //-----------------------------------Division entre modificar comprar/vender y no hacerlo ------------------//
      if ("mercader" in changes) { // comrpobamos si se modifica el mercader
        if(transaction.innBuying) {
          const searchedTrader = await TraderModel.findById(changes.mercader)
          if (!searchedTrader) { // comprobamos que exista el nuevo mercader
            reject('Error: cannot modify the trader, because its not registered')
          }
        }
        else {
          const searchedHunter = await Hunter.findById(changes.mercader)
          if (!searchedHunter) { // comprobamos que  exista el nuevo mercader
            reject('Error:cannot modify the hunter, because its not registered')
          }
        }
      }
      if ("date" in changes) { // comprobamos si se modifica la fecha
        const newDate = new Date(changes.date)
        if (newDate > new Date()) {
          reject('Error: a transaction can`t have a future date')
        }
      }
      if ("crownValue" in changes) { // comprobamos si se modifica el valor de la corona
        const newCrownValue = changes.crownValue
        if (newCrownValue < 0) {
          reject('Error: a transaction can`t have a negative crown value')
        }
      }
      resolve(true)
    }
    catch(err){
      reject(err)
    }
  })
}

/**
 * Validates if the trader/hunter and all involved assets in the transaction exist in the database.
 * 
 * Ensures no duplicate assets are provided.
 * 
 * @param {TransactionDocumentInterface} transaction - The transaction to validate.
 * @returns {Promise<boolean>} - Resolves true if all checks pass, otherwise rejects with an error.
 */

export const checkDB = (transaction: TransactionDocumentInterface): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    if (!transaction.mercader || !transaction.bienes) {
      reject('Error: a trader and a colection of assets must be provided')
    }
    else { 
      try {
        if (transaction.innBuying) {
          //comprobamos la existencia del mercader
          const trader = await TraderModel.findById(transaction.mercader)
          if (!trader) {
            reject('Error: trader not registered')
          }
        } else {
          //comprobamos la existencia del mercader
          const hunter = await Hunter.findById(transaction.mercader)
          if (!hunter) {
            reject('Error: hunter not registered')
          }
        }
        //comprobamos la existencia de los bienes
        //y que no se haya indicado el mismo dos veces
        let bienes: string[] = []
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.findById(bien.asset)
          if (!searchedAsset) { // Si el asset no existe
            reject(`Error: Asset with ID ${bien.asset} not found`)
          }
          else {
            if (!bienes.includes(searchedAsset.name)) { //Si el asset no está duplicado
              bienes.push(searchedAsset.name)
            }
            else { //Si el asset esta duplicado
              reject('Error: duplicated assets')
            }
          }
        })
        resolve(true)

      }
      catch(err) {
        reject(err)
      }
    }
  })
}


/**
 * Updates asset stock based on a transaction. Can also reverse the operation (e.g., on delete).
 * 
 * If buying, it adds to the stock. If selling, it subtracts from the stock and ensures availability.
 * 
 * @param {TransactionDocumentInterface} transaction - The transaction to apply or reverse.
 * @param {boolean} [reverse] - If true, the stock update will be reversed.
 * @returns {Promise<boolean>} - Resolves true if the stock was successfully updated, otherwise rejects with an error.
 */

export const updateStock = (transaction: TransactionDocumentInterface, reverse?: boolean): Promise<boolean> => {
  return new Promise<boolean>(async(resolve, reject) => {
    let operation = transaction.innBuying
    if (reverse) //en caso de eliminar una transacción la operación se invierte
      operation = !transaction.innBuying
    try {
      //Si la posada está comprando, hay que añadir el bien o actualizar el stock
      if (operation) {
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.findById(bien.asset)
          if (!searchedAsset) { 
            reject(`Asset with ID ${bien.asset} not found`)
          }
          else {
            const newAmount = searchedAsset.amount + Number(bien.amount)
            await AssetModel.findOneAndUpdate({name: searchedAsset.name}, {amount: newAmount})
            resolve(true)
          }
        })
      }
      else {
        //Reducir la cantidad del bien o eliminarlo por completo si llega a 0
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.findById(bien.asset)
          if (!searchedAsset) {  //añadir 
            reject(`Asset with ID ${bien.asset} not found`)
          }
          else {
            const newAmount = searchedAsset.amount - Number(bien.amount)
            if (newAmount < 0) {
              reject(`Error: not enough ${searchedAsset.name} in stock`)
            } else {
              await AssetModel.findOneAndUpdate({name: searchedAsset.name}, {amount: newAmount})
              resolve(true)
            }
          }
        })
      }
    }
    catch(err){
      reject(err)
    }
  })
}