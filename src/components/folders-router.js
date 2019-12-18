const express = require("express");
const path = require('path')
const xss = require('xss')
const foldersRouter = express.Router();
const bodyParser = express.json();
const logger = require("../logger");
const folderService = require("./folder-service");
const { getFolderValidationError } = require('./folder-validator')

const serializefolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
})

foldersRouter
  .route('/')

  .get((req, res, next) => {
    folderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializefolder))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { folder_name } = req.body
    const newfolder = { folder_name }

    for (const field of ['folder_name']) {
      if (!newfolder[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    const error = getFolderValidationError(newfolder)

    if (error) return res.status(400).send(error)

    folderService.insertFolder(
      req.app.get('db'),
      newfolder
    )
      .then(folder => {
        // Ask about the path error 
        // console.log("location", path.posix.join(req.folder_id, `${folder.id}`))
        // console.log("then block", folder)
        logger.info(`folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${folder.id}`))
          .json(serializefolder(folder))
      })
      .catch(next)
  })


foldersRouter
  .route('/:folder_id')

  .all((req, res, next) => {
    const { folder_id } = req.params
    folderService.getById(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: { message: `folder Not Found` }
          })
        }

        res.folder = folder
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializefolder(res.folder))
  })

  .delete((req, res, next) => {
    const { folder_id } = req.params
    folderService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        logger.info(`folder with id ${folder_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { folder_name } = req.body
    const folderToUpdate = { folder_name }

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'folder_name'`
        }
      })
    }

    const error = getFolderValidationError(folderToUpdate)

    if (error) return res.status(400).send(error)

    folderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter;
