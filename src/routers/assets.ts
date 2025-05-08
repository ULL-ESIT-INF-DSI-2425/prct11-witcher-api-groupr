import {AssetModel} from '../models/asset.js';
import express from 'express';


export const Assetrouter = express.Router()

Assetrouter.use(express.json())

/**
 * @route GET /assets/:id
 * @summary Get an asset by ID
 * @param req.params.id - The ID of the asset to retrieve
 * @returns 200 - Asset found
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */
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

/**
 * @route GET /assets
 * @summary Get all assets or filter by query parameters
 * @param req.query - Optional filters for asset fields
 * @returns 200 - Assets found
 * @returns 404 - No assets matched
 * @returns 500 - Server error
 */

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
    if (!assets) {
      res.status(404).send('Asset not found')
    }
    else {
      res.status(200).send(assets);
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
})

/**
 * @route POST /assets
 * @summary Create a new asset or increase amount if it already exists
 * @param req.body - Asset data (must match AssetModel schema)
 * @returns 201 - Asset created
 * @returns 200 - Asset amount updated
 * @returns 400 - Missing body
 * @returns 500 - Server error
 */

Assetrouter.post('/assets', async (req, res) => {
  if(!req.body) {
    res.status(400).send('Assets characteristics must be given on the body ')
  }
  try {
    //const asset = new AssetModel(req.body)
    //console.log(req.body)
    const filter = req.body.name ? { name: req.body.name } : {};
    const asset = await AssetModel.find(filter)
    if ( asset.length !== 0) {
      const assetId = asset[0]._id;
      // Aumento el el amount con el inc y devuelvo el nuevo valor con new
      const updatedAsset = await AssetModel.findByIdAndUpdate(
        assetId,
        { $inc: { amount: req.body.amount } },
        { new: true }
      );
      res.status(200).send(updatedAsset);
    } else {
      const newAsset = new AssetModel(req.body)
      await newAsset.save()
      res.status(201).send(newAsset)
    }
  } catch (err) {
    res.status(500).send({error:err})
  }
})

/**
 * @route DELETE /assets/:id
 * @summary Delete an asset by ID
 * @param req.params.id - ID of the asset to delete
 * @returns 200 - Asset deleted successfully
 * @returns 400 - Missing or invalid ID
 * @returns 500 - Server error
 */

Assetrouter.delete('/assets/:id', async (req, res) => {
  if( !req.params.id) {
    res.status(400).send("No id in the query")
  }
  try {
    const assetModel = await AssetModel.findByIdAndDelete(req.params.id)
    if(!assetModel) {
      res.status(400).send({error: `Asset with id ${req.params.id} not found`})
    } else {
      res.status(200).send(assetModel)
    }
  } catch(err) {
    res.status(500).send({error:err})
  }
})

/**
 * @route DELETE /assets
 * @summary Delete an asset by filters
 * @param req.query - Fields to match for deletion
 * @returns 200 - Asset deleted
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */

Assetrouter.delete('/assets', async (req, res) => {
  if(!req.params) {
    res.status(400).send()
  }
  try {
    const allowedFields = [ 'name', 'description', 'weight', 'material', 'crown_value', 'amount'];
    const filter: any = {};
    for (const field of allowedFields) {
      if (req.query[field] !== undefined) {
        if (['weight', 'crown_value', 'amount'].includes(field)) {
          filter[field] = Number(req.query[field]);
        } else {
          filter[field] = req.query[field];
        }
      }
    }
    //console.log(filter)
    const assets = await AssetModel.findOneAndDelete(filter, req.body);
    if (!assets) {
      res.status(404).send('Asset not found')
    }
    else {
      res.status(200).send(assets);
    }
  } catch(error) {
    res.status(500).send()
  }
})

/**
 * @route PATCH /assets
 * @summary Update asset fields based on query filters
 * @param req.query - Fields to match assets
 * @param req.body - Fields to update
 * @returns 200 - Asset updated
 * @returns 400 - Invalid field or missing params
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */

Assetrouter.patch('/assets', async (req, res) => {
  if (!req.params) {
    res.status(400).send({
      error: "params not found"
    })
  } else {
    const allowedFields = [ 'name', 'description', 'weight', 'material', 'crown_value', 'amount', 'type'];
    const filter: any = {};
    const actualChanges = Object.keys(req.body)
    const isValidChange = actualChanges.every((change) => {return allowedFields.includes(change)})
    
    if (!isValidChange) {
      res.status(400).send({
        error: 'Trying to modify a non allowed atribute'
      })
    }
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
    try {
      const assets = await AssetModel.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true
      })
      if( !assets ) {
        res.status(404).send()
      } else {
        res.status(200).send(assets)
      }
    }catch(err) {
      res.status(500).send()
    }
  }

});

/**
 * @route PATCH /assets/:id
 * @summary Update an asset by ID
 * @param req.params.id - ID of the asset to update
 * @param req.body - Fields to update
 * @returns 200 - Asset updated successfully
 * @returns 400 - Invalid update or missing ID
 * @returns 404 - Asset not found
 * @returns 500 - Server error
 */

Assetrouter.patch('/assets/:id', async (req, res) => {
  if(!req.params.id) {
    res.status(400).send({error: "No id"})
  } else {
    const allowedFields = [ 'name', 'description', 'weight', 'material', 'crown_value', 'amount', 'type'];
    const actualChanges = Object.keys(req.body)
    const isValidChange = actualChanges.every((change) => {return allowedFields.includes(change)})
    
    if (!isValidChange) {
      res.status(400).send({
        error: 'Trying to modify a non allowed atribute'
      })
    }
    try {
      const asset = await AssetModel.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
      })
      if(!asset) {
        res.status(404).send({ error: "Asset not found" })
      } else {
        res.status(200).send(asset)
      }
    } catch (error) {
      res.status(500).send()
    }
  }
})