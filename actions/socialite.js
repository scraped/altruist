'use strict'

const settings = require('../src/lib/settings').actions.socialite
const request = require('request')

const baseURL = settings.baseURL
const route = settings.uploadRoute

function formDataFile (value, name, type) {
  return {
    value: value,
    options: {
      filename: name,
      contentType: type
    }
  }
}

function sendRequest (formData) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      err && reject(new Error(err))
      resolve(body)
    })
  })
}

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server

    let formData = {
      bucket: options.bucket || settings.bucket,
      token: options.token || settings.token,
      name: options.media[0].file || options.media[0].name,
      file: null
    }
    if (!formData.name) {
      reject(new Error('No name provided in request'))
    }

    if (options.media && Array.isArray(options.media) && options.media.length > 0) {
      formData.file = formDataFile(Buffer.from(options.media[0].content, 'base64'), formData.name, options.media[0].type)
      sendRequest(formData)
        .then(body => resolve(body))
        .catch(error => reject(error))
    } else {
      reject(new Error('No media provided in request'))
    }
  })
}

module.exports = { run }
