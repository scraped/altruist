'use strict'

const settings = require('../src/lib/settings')
const scpClient = require('scp2')

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!options.source || options.source === '') {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: '"source" does not exist or is empty.'
      })))
    } else if ((!options.user || options.user === '') && (!settings.actions.scp.user || settings.actions.scp.user === '')) {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: '"user" does not exist or is empty.'
      })))
    } else if ((!options.hostname || options.hostname === '') && (!settings.actions.scp.hostname || settings.actions.scp.hostname === '')) {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: '"hostname" does not exist or is empty.'
      })))
    } else if ((!options.target || options.target === '') && (!settings.actions.scp.target || settings.actions.scp.target === '')) {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: '"target" does not exist or is empty.'
      })))
    }

    const user = options.user || settings.actions.scp.user
    const password = options.password || settings.actions.scp.password || ''
    const hostname = options.hostname || settings.actions.scp.hostname
    const target = options.target || settings.actions.scp.target

    const dest = `${user}:${password}@${hostname}:${target}`

    scpClient.scp(options.source, dest, function (err) {
      if (err) {
        return reject(new Error(JSON.stringify(err)))
      }
      resolve()
    })
  })
}

module.exports = {
  run
}
