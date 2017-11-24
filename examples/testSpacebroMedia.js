const { SpacebroClient } = require('spacebro-client')
var settings = require('standard-settings').getSettings()

settings.service.spacebro.client.name = settings.service.spacebro.client.name + 'test'
const spacebro = new SpacebroClient()

// issue, meta.email is saved and will be used in next media if does not cointain meta.email
// issue: mandrill.to.email does not work anymore
setTimeout(function () {
  /*
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    url: 'http://snapbox01.estu.la:36700/?action=snapshot',
    file: 'test.jpg',
    meta: {
      altruist: {
        action: ['mandrill'],
        mandrill: {
          to: {
            email: 'e@soixantecircuits.fr'
          }
        }
      }
    }
  })
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    path: '/home/emmanuel/Downloads/2017-11-10T20-37-27-779.mp4',
    // url: 'http://10.11.12.57:36101/2017-08-26T18-20-19-451.mp4',
    details: {
      thumbnail: {
        url: 'http://snapbox01.estu.la:36700/?action=snapshot',
        file: 'test.jpg'
      }
    },
    meta: {
      email: 'e@soixantecircuits.fr',
      share: 'http://soixantecircuits.fr',
      altruist: {
        action: ['mandrillPlusSocialite']
      }
    }
  })
  */
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    // url: 'http://snapbox01.estu.la:36700/?action=snapshot',
    path: '/home/emmanuel/Downloads/2017-11-10T20-37-27-779.mp4',
    // file: 'test.jpg',
    details: {
      thumbnail: {
        url: 'http://snapbox01.estu.la:36700/?action=snapshot',
        file: 'test.jpg'
      }
    },
    meta: {
      email: 'emmanuel@soixantecircuits.fr',
      share: 'http://soixantecircuits.fr',
      altruist: {
        action: ['mandrillPlusSocialite'],
        mandrillPlusSocialite: {
          doNotSendMediaInEmail: true,
          doNotSendThumbnailInEmail: false
        }
      } /*,
      altruistResponse: {
        stuff: 'things'
      } */
    }
  })
  console.log('Event emitted')
}, 1500)

spacebro.on('response', (data) => {
  console.log('response', JSON.stringify(data, null, 2))
})
