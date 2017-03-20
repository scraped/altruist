'use strict'

const passport = require('passport')
const request = require('request')
const stream = require("stream")
var fb = new require('fb')
fb.options({ version: 'v2.8' })
const config = require('../src/lib/config')

const communityID = config.actions.workplace.communityID
const token = config.actions.workplace.token
const groupID = config.actions.workplace.groupID

function getMediaType (media) {
  if (media) {
    if (media.isBinary) {
      return media.contentType.search(/video/gi) > -1 ? 'videos' : 'photos'
    } else {
      // this will only match filepath, but since there's no such things as base64 videos it's no issue
      return /(\.mov|\.mpe?g?4?|\.wmv)/gi.test(media) ? 'videos' : 'photos'
    }
  } else {
    return null
  }
}

function handlePostRequest (options, resolve, reject) {
  let message = options.message
  let media = options.media
  const isMedia = (media)
  const mediaType = getMediaType(media)
  const datas = {}

  const reHTTP = /^https?:\/\//i
  const reBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

  datas[isMedia ? (mediaType === 'videos' ? 'description' : 'caption') : reHTTP.test(message) ? 'link' : 'message'] = message

  if (isMedia) {
    if (reHTTP.test(media)) {
      mediaType === 'videos' ? datas.file_url = media : datas.url = media
    } else if (reBase64.test(media)) {
      // ???
    } else if (media.isBinary) {
      datas.source = {
        value: media.data,
        options: {
          contentType: media.contentType,
          filename: media.filename
        }
      }
    } else {
      datas.source = require('fs').createReadStream(media)
    }
  }

  if (options.link) {
    datas.link = options.link
  }

  fb.setAccessToken(token)

  fb.api('/1851839528398507', (res) => {
    if (!res || res.error) {
      console.error(res.error)
    } else {
      console.log(res)
    }
  })

  fb.api(`/${groupID}/${isMedia ? mediaType : 'feed'}`, 'post', datas, (res) => {
    if (!res || res.error) {
      return reject({ error: res.error.code, details: res.error.message })
    }
    return resolve(res)
  })
}

function run (options, request) {
  return new Promise((resolve, reject) => {
    const message = (options.message || options.caption)
      ? options.message || options.caption
      : config.actions.facebook.message || ''
    const media = options.media
      ? options.media
      : config.actions.facebook.media || ''
    const link = options.link ? options.link : config.actions.facebook.link

     if ((!message) && (!media) && !request.file && !link) {
      return reject({
        error: 'invalid argument',
        details: 'No message, link or media in facebook POST request.'
      })
    }

    // If multer detects a file upload, get the first file and set options to upload to facebook
    if (request.files && request.files[0]) {
      options.media = {
        isBinary: true,
        filename: request.files[0].originalname,
        data: request.files[0].buffer,
        contentType: request.files[0].mimetype,
        file: request.files[0]
      }
    }

    handlePostRequest(options, resolve, reject)
  })
}

module.exports = {
run}
