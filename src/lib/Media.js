'use strict'
const mediaHelper = require('media-helper')
const fs = require('fs')
const path = require('path')
const request = require('request').defaults({ encoding: null })
const standardSettings = require('standard-settings')
var settings = standardSettings.getSettings()

class Media {
  constructor (data) {
    if (typeof data === 'object') {
      Object.assign(this, data)
    } else if (typeof data === 'string') {
      if (mediaHelper.isFile(data)) {
        this.path = data
      } else if (mediaHelper.isURL(data)) {
        this.url = data
      }
    }
  }

  fromMulter (data) {
    if (!Array.isArray(data)) {
      Object.assign(this, data)
    } else {
      for (let i in data) {
        if (i === 0) {
          Object.assign(this, data[i])
        } else {
          let details = {}
          details[data[i].fieldname] = data[i]
          Object.assign(this.details, details)
        }
      }
    }
  }

  async getBase64 () {
    if (this.isMedia()) {
      await this.urlToPath()
      this.base64 = await mediaHelper.fileToBase64(this.path)
      if (this.details) {
        await this.urlToPathDetails()
        for (var prop in this.details) {
          if (this.details.hasOwnProperty(prop)) {
            let media = this.details[prop]
            if (typeof media === 'object') {
              if (media.path) {
                media.base64 = await mediaHelper.fileToBase64(media.path)
              } else {
                console.error('media ' + JSON.stringify(media, null, 2) + ' misses a path. Is url missing too?')
              }
            }
          }
        }
      }
      return this.base64
    } else {
      return ''
    }
  }

  async getMimeType () {
    if (this.isMedia()) {
      await this.urlToPath()
      this.type = await mediaHelper.getMimeType(this.path)
      if (this.details) {
        await this.urlToPathDetails()
        for (var prop in this.details) {
          if (this.details.hasOwnProperty(prop)) {
            let media = this.details[prop]
            media.type = await mediaHelper.getMimeType(media.path)
          }
        }
      }
      return this.type
    } else {
      return 'application/json'
    }
  }

  get array () {
    if (this.details) {
      return [this].concat(Object.values(this.details))
    } else {
      return [this]
    }
  }

  urlToPath () {
    return new Promise((resolve, reject) => {
      if (this.path && mediaHelper.isFile(this.path)) {
        resolve(this.path)
      } else {
        let filePath = path.join(settings.folder.output, this.getFilename())
        if (this.url) {
          request(this.url)
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => {
              this.path = filePath
              resolve(filePath)
            })
            .on('error', reject)
        } else {
          reject(new Error('no path, no url'))
        }
      }
    })
  }

  isMedia () {
    return this.path || this.url
  }

  async urlToPathDetails () {
    if (this.details) {
      for (var prop in this.details) {
        if (this.details.hasOwnProperty(prop)) {
          let media = this.details[prop]
          if ((!media.path || !mediaHelper.isFile(media.path)) && media.url) {
            media = new Media(media)
            await media.urlToPath()
            this.details[prop] = media
          }
        }
      }
    }
  }

  getFilename () {
    this.filename = this.filename || this.file || (this.path && path.basename(this.path)) || (this.url && path.basename(this.url))
    return this.filename
  }
}

module.exports = {
  Media
}

/*
const media = new Media({path: '/home/emmanuel/Downloads/00-header', url: 'that'})
console.log(media.path)
media.getBase64().then(() => {
  console.log(media.base64)
})
media.getMimeType().then(() => {
  console.log(media.type)
})
console.log(media.array)
console.log(JSON.stringify(media))
*/
