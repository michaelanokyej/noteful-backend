const express = require("express");
const path = require('path')
const xss = require('xss')
const notesRouter = express.Router();
const bodyParser = express.json();
const logger = require("../logger");
const noteService = require("./note-service");
const { getNoteValidationError } = require('./note-validator')

const serializenote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  folder_id: xss(note.folder_id),
  content: xss(note.content), 
  modified: note.modified,
})

notesRouter
  .route('/')

  .get((req, res, next) => {
    noteService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializenote))
      })
      .catch(next)
  })
  // Ask about unauthorized request and how to use set for tokens 

  .post(bodyParser, (req, res, next) => {
    const { note_name, folder_id, content } = req.body
    const newnote = { note_name, folder_id, content }

    for (const field of ['note_name', 'folder_id', 'content']) {
      if (!newnote[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    const error = getNoteValidationError(newnote)

    if (error) return res.status(400).send(error)

    noteService.insertNote(
      req.app.get('db'),
      newnote
    )
      .then(note => {
        logger.info(`note with id ${note.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${note.id}`))
          .json(serializenote(note))
      })
      .catch(next)
  })


notesRouter
  .route('/:note_id')

  .all((req, res, next) => {
    const { note_id } = req.params
    noteService.getById(req.app.get('db'), note_id)
      .then(note => {
        if (!note) {
          logger.error(`note with id ${note_id} not found.`)
          return res.status(404).json({
            error: { message: `note Not Found` }
          })
        }

        res.note = note
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializenote(res.note))
  })

  .delete((req, res, next) => {
    const { note_id } = req.params
    noteService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(numRowsAffected => {
        logger.info(`note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { note_name, folder_id, content, rating } = req.body
    const noteToUpdate = { note_name, folder_id, content, rating }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'note_name', 'folder_id', or 'content'`
        }
      })
    }

    const error = getNoteValidationError(noteToUpdate)

    if (error) return res.status(400).send(error)

    noteService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter;
