import {AssetModel} from '../models/asset.js';
import express from 'express';
import '../db/mongoose.js'; // Las 3 bases de datos


export const Assetrouter = express.Router()

Assetrouter.use(express.json())

//Gets

Assetrouter.get('/assets/:id', async (req, res) => {
  try {
    const asset = await AssetModel.findById(req.params.id)
    if( !asset ) {
      res.status(404).send()
    } else {
      res.status(201).send(asset)
    }
  } catch (err) {
    res.status(500).send({error: err})
  }
})


Assetrouter.get('/assets', async (req, res) => {
  try {
    const allowedFields = [ 'name', 'description', 'weight', 'material', 'crown_value', 'amount'];
    const filter: any = {};
  
    for (const field of allowedFields) {
      if (req.query[field] !== undefined) {
        // Convertir números que vienen como string
        if (['weight', 'crown_value', 'amount'].includes(field)) {
          filter[field] = Number(req.query[field]);
        } else {
          filter[field] = req.query[field];
        }
      }
    }

    const assets = await AssetModel.find(filter);
    res.status(200).send(assets);
  } catch (err) {
    res.status(500).send({ error: err });
  }
})

//Post

Assetrouter.post('/assets', async (req, res) => {
  if(!req.body) {
    res.status(400).send('Assets characteristics must be given on the body ')
  }
  try {
    const asset = new AssetModel(req.body)
    await asset.save()
    res.status(201).send(asset)
  } catch (err) {
    res.status(500).send({error:err})
  }
})

// Delete

Assetrouter.delete('/assets/:id', async (req, res) => {
  if( !req.params.id) {
    res.status(400).send("No id in the query")
  }
  try {
    const assetModel = await AssetModel.findByIdAndDelete(req.params.id)
    if(!assetModel) {
      res.status(400).send({error: `Asset with id ${req.params.id} not found`})
    } else {
      res.status(200).send()
    }
  } catch(err) {
    res.status(500).send({error:err})
  }
})
