'use strict'

const Mailchimp = require('mailchimp-api-v3')
const config = require('../src/lib/config')

const API_KEY = config.actions.mailchimp.APIkey
const mailchimp = (API_KEY) ? new Mailchimp(API_KEY) : null

function mapListMember (member) {
  return {
    email_address: member.email,
    merge_fields: {
      LNAME: member.lname,
      FNAME: member.fname
    },
    status: 'subscribed'
  }
}

module.exports = (options) => {
  const members = Array.isArray(options) ? options.map(m => mapListMember(m)) : [ mapListMember(options) ]

  return new Promise((resolve, reject) => {
    mailchimp
      .post(`/lists/${config.actions.mailchimp.listID}`, {
        members: members
      }).then((results) => {
        if (results.errors.length) return reject(results.errors)
        resolve(results)
      })
      .catch((err) => {
        console.log(err)
        reject(err.errors)
      })
  })
}