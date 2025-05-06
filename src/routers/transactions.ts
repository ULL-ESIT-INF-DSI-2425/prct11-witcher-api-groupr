import express from 'express';
import '../db/mongoose.js';
import { Transaction, TransactionDocumentInterface } from '../models/transaction.js';
import { TraderModel } from '../models/traders.js';
import { AssetModel, Asset } from '../models/asset.js';

export const transactionApp = express.Router()

transactionApp.use(express.json())

transactionApp.get('/transactions', async (req, res) => {
  if (!req.query.name && !req.query.firstDay) {
    res.status(400).send('A trader Name or a date must be provided')
  }
  else if (req.query.name) {
    try {
      const transaction = await Transaction.find({name: req.query.name})
      if (!transaction) {
        res.status(404).send(`Trader wiht name ${req.query.name} not found`)
      }
      else {
        res.status(200).send(transaction)
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
      await checkDB(req.body)
      let  transaction = new Transaction(req.body)
      //registramos la transación
      transaction = await transaction.save()
      //actualizamos el stock disponible de cada bien
      await updateStock(req.body)
      res.status(201).send(transaction)
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})

transactionApp.patch('/transactions/:id', async(req, res) => {

})

transactionApp.delete('/transactions/:id', async(req, res) => {
  if (!req.query.id) {
    res.status(400).send('Error: a transaction id must be provided')
  }
  else {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.query.id)
      if (!transaction) {
        res.status(404).send(`Transaction with id ${req.query.id} not found`)
      }
      else {
        //actualizamos el stock de los bienes
        updateStock(transaction)
        res.status(200).send(transaction)
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})

export const checkDB = (transaction: TransactionDocumentInterface): Promise<boolean> => {
  return new Promise<boolean>(async (resolve, reject) => {
    if (!transaction.mercader || !transaction.bienes) {
      reject('Error: a trader and a colection of assets must be provided')
    }
    else {
      const filter = {name: transaction.mercader.name}
      try {
        //comprobamos la existencia del mercader
        const trader = await TraderModel.find(filter)
        if (trader.length === 0) {
          reject('Error: trader not registered')
        }
        else {
          //comprobamos la existencia de los bienes
          //y que no se haya indicado el mismo dos veces
          let bienes: string[] = []
          transaction.bienes.forEach(async bien => {
            const searchedAsset = await AssetModel.findById(bien.asset)
            if (!searchedAsset) { // Si el asset no existe
              reject(`Error: Asset with ID ${bien.asset} not found`)
            }
            else {
              if (!bienes.includes(searchedAsset.name)) {
                bienes.push(searchedAsset.name)
              }
              else { //Si el asset esta duplicado
                reject('Error: duplicated assets')
              }
            }
          })
          //Ahora debemos comprobar que haya la cantidad necesaria de cada asset
          transaction.bienes.forEach(async bien => {
            const searchedAsset = await AssetModel.findById(bien.asset) as Asset //ya verificamos que todos los asset existen
            if (searchedAsset.amount < Number(bien.amount)) { 
              reject(`There isn't sufficient amount of ${searchedAsset.name}`)
            }
          })
          resolve(true)
        }
      }
      catch(err) {
        reject(err)
      }
    }
  })
}

export const updateStock = (transaction: TransactionDocumentInterface, reverse?: boolean): Promise<boolean> => {
  return new Promise<boolean>(async(resolve, reject) => {
    if (reverse) //en caso de eliminar una transacción la operación se invierte
      transaction.innBuying = !transaction.innBuying
    try {
      //Si la posada está comprando, hay que añadir el bien o actualizar el stock
      if (transaction.innBuying) {
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.findById(bien.asset)
          if (!searchedAsset) {  //añadir 
            reject(`Asset with ID ${bien.asset} not found`)
          }
          else {
            const newAmount = searchedAsset.amount + Number(bien.amount)
            await AssetModel.findOneAndUpdate({name: searchedAsset.name}, {amount: newAmount})
          }
        })
      }
      else {
        //Reducir la cantidad del bien o eliminarlo por completo si llega a 0
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.findById(bien.asset) as Asset // Si se esta eliminando implica que ya se ha registrado 
          const newAmount = searchedAsset.amount - Number(bien.amount)
          await AssetModel.findByIdAndUpdate({amount: newAmount})
          resolve(true)
        })
      }
    }
    catch(err){
      reject(err)
    }
  })
}