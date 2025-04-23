import express from 'express';
import '../db/mongoose.js';
import { TraderModel } from '../models/mercaderes.js';


const tradersRouter = express();
const port = process.env.PORT || 3000

tradersRouter.use(express.json())


tradersRouter.post('/traders', (req, res) => {
  const trader = new TraderModel(req.body)
  trader.save()
  .then((trader) => {
    res.status(201).send(trader)
  })
  .catch((err) => {
    res.status(400).send({
      error: err
    })
  })
})

tradersRouter.get('/traders', (req, res) => {
  const filter = req.query.name ? { name: req.query.name } : {};
  TraderModel.find(filter).then((traders) => {
    if (traders.length === 0) {
      res.status(404).send()
    } else {
      res.status(200).send(traders)
    }
  }).catch((err) => {
    res.status(500).send({
      error: err
    });
  });
});

tradersRouter.get('/traders/:id', (req, res) => {
  TraderModel.findById(req.params.id).then((trader) => {
    if (!trader) {
      res.status(404).send();
    } else {
      res.send(trader);
    }
  }).catch(() => {
    res.status(500).send();
  });
});

tradersRouter.patch('/traders', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided in the query string',
    });
  } else if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  } else {
    const allowedUpdates = ['id', 'name', 'type', 'location'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted or has invalid types',
      });
    } else {
      TraderModel.findOneAndUpdate({name: req.query.name.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((trader) => {
        if (!trader) {
          res.status(404).send();
        } else {
          res.send(trader);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

tradersRouter.patch('/traders/:id', (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  } else {
    const allowedUpdates = ['id', 'name', 'type', 'location'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      TraderModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).then((trader) => {
        if (!trader) {
          res.status(404).send();
        } else {
          res.send(trader);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

tradersRouter.delete('/traders', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided',
    });
  } else {
    TraderModel.findOneAndDelete({title: req.query.name.toString()}).then((trader) => {
      if (!trader) {
        res.status(404).send();
      } else {
        res.send(trader);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

tradersRouter.delete('/traders/:id', (req, res) => {
  TraderModel.findByIdAndDelete(req.params.id).then((trader) => {
    if (!trader) {
      res.status(404).send();
    } else {
      res.send(trader);
    }
  }).catch(() => {
    res.status(400).send();
  });
});


tradersRouter.all('/{*splat}', (_, res) => {
  res.status(501).send()
})

tradersRouter.listen(port, () => {
  console.log(`Listening on port ${port}`)
})