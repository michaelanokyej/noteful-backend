// const { isWebUri } = require('valid-url')
const logger = require('../logger')

const NO_ERRORS = null

function getNoteValidationError({ content, folder_id, note_name }) {
  if (folder_id &&
    (!Number.isInteger(folder_id) || folder_id < 0 || folder_id > 5)) {
    logger.error(`Invalid folder_id '${folder_id}' supplied`)
    return {
      error: {
        message: `'folder_id' must be a number between 0 and 5`
      }
    }
  }


//   if (url && !isWebUri(url)) {
//     logger.error(`Invalid url '${url}' supplied`)
//     return {
//       error: {
//         message: `'url' must be a valid URL`
//       }
//     }
//   }

//   return NO_ERRORS
}

module.exports = {
  getNoteValidationError,
}