import express from 'express';
import '../db/mongoose.js';
import { Transaction, TransactionDocumentInterface } from '../models/transaction.js';
import { TraderModel } from '../models/traders.js';
import { AssetModel } from '../models/asset.js';

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
      // const filter = {name: transaction.mercader.name}
      try {
        //comprobamos la existencia del mercader
        const trader = await TraderModel.findById(transaction.mercader)
        if (!trader) {
          reject('Error: trader not registered')
        }
        else {
          //comprobamos la existencia de los bienes
          if (transaction.innBuying) {
            //Si los esta comprando la posada no hace falta comprobar que existan
            resolve(true)
          }
          else { // en caso de estar vendiendo
            //Comprobamos que no se repita el mismo bien 2 veces
            let bienes: string[] = []
            transaction.bienes.forEach(bien => {
              if (!bienes.includes(bien.name)) {
                bienes.push(bien.name)
              }
              else {
                reject('Error: duplicated assets')
              }
            })
            //Ahora debemos comprobar que existan todos los bienes y comprobar que haya la cantidad necesaria
            transaction.bienes.forEach(async bien => {
              const searchedAsset = await AssetModel.find({name: bien.name})
              if (searchedAsset.length === 0) {
                reject('The asset was not found')
              }
              else if (searchedAsset[0].amount < bien.amount) {
                reject(`There isn't sufficient amount of ${bien.name}`)
              }
            })
            resolve(true)
          }
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
    if (reverse)
      transaction.innBuying = !transaction.innBuying
    try {
      //Si la posada está comprando, hay que añadir el bien o actualizar el stock
      if (transaction.innBuying) {
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.find({name: bien.name})
          if (searchedAsset.length === 0) {
            const asset = new AssetModel(bien)
            await asset.save()
            resolve(true)
          }
          else {
            const searchedAsset = await AssetModel.find({name: bien.name})
            const newAmount = searchedAsset[0].amount + bien.amount
            await AssetModel.findOneAndUpdate({name: bien.name}, {amount: newAmount})
          }
        })
      }
      else {
        //Reducir la cantidad del bien o eliminarlo por completo si llega a 0
        transaction.bienes.forEach(async bien => {
          const searchedAsset = await AssetModel.find({name: bien.name})
          const newAmount = searchedAsset[0].amount - bien.amount
          if (newAmount > 0) { //actualizar cantidad
            AssetModel.findOneAndUpdate({name: bien.name}, {amount: newAmount})
          }
          else {  //eliminar el bien
            AssetModel.findOneAndDelete({name: bien.name})
          }
          resolve(true)
        })
      }
    }
    catch(err){
      reject(err)
    }
  })
}