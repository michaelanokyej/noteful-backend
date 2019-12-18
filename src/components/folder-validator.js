// const { isWebUri } = require('valid-url')
const logger = require('../logger')

const NO_ERRORS = null

function getFolderValidationError( folder_name ) {
  if (folder_name === null || folder_name === undefined ) {
    logger.error(`Invalid folder_name '${folder_name}' supplied`)
    return {
      error: {
        message: `'folder_name' must be a provided`
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
  getFolderValidationError,
}