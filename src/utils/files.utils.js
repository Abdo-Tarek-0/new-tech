import path from 'path'
import fs from 'fs/promises'

import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const srcPath = path.join(__dirname, '..')

const deleteFile = async (filePath) => {
   // helper function to delete a file
   await fs.unlink(filePath)
}

export const deleteUploadedFile = async (customPath) => {
   // get the full path of the file
   const fullPath = path.join(srcPath, customPath)

   // delete the file
   await deleteFile(fullPath)

   return customPath
}
export const deleteUploadedFiles = async () => {}
