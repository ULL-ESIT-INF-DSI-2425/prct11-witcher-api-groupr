import express from 'express';
import '../db/mongoose.js';
import { Transaction, TransactionDocumentInterface, Bien} from '../models/transaction.js';
import { TraderModel } from '../models/traders.js';
import { Hunter } from '../models/hunters.js';
import { AssetModel } from '../models/asset.js';

export const transactionApp = express.Router()

transactionApp.use(express.json())

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
      // const transaction = await Transaction.find({mercader: req.query.name})
      // if (!transaction) {
      //   res.status(404).send(`Trader wiht name ${req.query.name} not found`)
      // }
      // else {
      //   res.status(200).send(transaction)
      // }
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
      await checkChanges(req.body, searchedTransaction)
      const modifiedTransaction = await Transaction.findByIdAndUpdate(req.body)
      res.status(201).send(modifiedTransaction)
    }
  }
  catch(err) {

  }
})

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

export const checkChanges = (changes, transaction: TransactionDocumentInterface): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      if ("innBuying" in changes) { // comprobamos si se va a modificar de compra a venta o viceversa
        transaction.innBuying = changes.innBuying // modificamos el valor de la transacción
      }
      //-----------------------------------Division entre modificar comprar/vender y no hacerlo ------------------//
      else {  // compra/venta no se modifica
        if ("mercader" in changes) { // comrpobamos si se modifica el mercader
          if(transaction.innBuying) {
            const searchedTrader = await TraderModel.find({name: changes.mercader})
            if (searchedTrader.length === 0) { // comprobamos que exista el nuevo mercader
              reject('Error: cannot modify the trader, because its not registered')
            }
          }
          else {
            const searchedHunter = await Hunter.find({name: changes.mercader})
            if (searchedHunter.length === 0) { // comprobamos que  exista el nuevo mercader
              reject('Error:cannot modify the hunter, because its not registered')
            }
          }
        }
        if ("bienes" in changes) {  // comprobamos si se modifican los bienes
          const newAssets: Bien[] = changes.bienes // nuevo array de bienes
          //comrpobamos primero que todos los assets existan y haya suficiente stock
          newAssets.forEach(async asset => {
            const searchedAsset = await AssetModel.find({name: asset.asset})
            if (searchedAsset.length === 0) {
              reject('Error: one of the new assets are not registered')
            }
          })
          //actualizamos el stock de todos los bienes
          const oldAssets: Bien[] = transaction.bienes // bienes antes de ser modificados
          newAssets.forEach(async asset => {
            const oldAsset = await AssetModel.find({name: asset.asset})
            let assetFound = false
            let index = 0
            let counter = 0
            oldAssets.forEach(asset2 => {
              if (asset2.asset === asset.asset) {
                assetFound = true
                index = counter
              }
              ++counter
            })
            if (assetFound) {
              if (transaction.innBuying) { //comprar, ++amount
                const newAmount = oldAsset[0].amount + Number(asset.amount) - Number(oldAssets[index].amount)
                await AssetModel.findOneAndUpdate({name: asset.asset}, {amount: newAmount})
              }
              else {  //vender, --amount
                const newAmount = oldAsset[0].amount + Number(oldAssets[index].amount) - Number(asset.amount)
                await AssetModel.findOneAndUpdate({name: asset.asset}, {amount: oldAsset[0].amount - Number(asset.amount)})
              }
            }
            else { // si no estaba, solo sumamos o restamos la cantidad 
              if (transaction.innBuying) { //comprar, ++amount
                await AssetModel.findOneAndUpdate({name: asset.asset}, {amount: oldAsset[0].amount + Number(asset.amount)})
              }
              else {  //vender, --amount
                await AssetModel.findOneAndUpdate({name: asset.asset}, {amount: oldAsset[0].amount - Number(asset.amount)})
              }
            }
          })
        }
        resolve(true)
      }
    }
    catch(err){
      reject(err)
    }
  })
}

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