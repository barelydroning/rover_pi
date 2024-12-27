import roverServer, { EVENTS } from '../server.js'
import { Gpio } from 'onoff'

const RED_PIN = 17
const GREEN_PIN = 27
const BLUE_PIN = 22

const redLight = new Gpio(RED_PIN, 'out')
const greenLight = new Gpio(GREEN_PIN, 'out')
const blueLight = new Gpio(BLUE_PIN, 'out')

const setLightColor = color => {
  redLight.writeSync(0)
  greenLight.writeSync(0)
  blueLight.writeSync(0)

  switch (color) {
    case 'red':
      redLight.writeSync(1)
      break
    case 'green':
      greenLight.writeSync(1)
      break
    case 'blue':
      blueLight.writeSync(1)
      break
    case 'yellow':
      redLight.writeSync(1)
      greenLight.writeSync(1)
      break
    case 'purple':
      redLight.writeSync(1)
      blueLight.writeSync(1)
      break
    case 'cyan':
      greenLight.writeSync(1)
      blueLight.writeSync(1)
      break
    case 'white':
      redLight.writeSync(1)
      greenLight.writeSync(1)
      blueLight.writeSync(1)
      break
    case 'off':
      redLight.writeSync(0)
      greenLight.writeSync(0)
      blueLight.writeSync(0)
      break
  }
}

// Initialize lights to off
setLightColor('off')

roverServer.on(EVENTS.COMMAND, ({ type, command }) => {
  console.log('Received command:', type, command)
  if (type === 'motors') {
    roverServer.writeToSerial(command)
  } else if (type === 'kill') {
    roverServer.writeToSerial({ A: 0, B: 0 })
  } else if (type ==='color') {
    setLightColor(command.color)
  }
})

roverServer.on(EVENTS.CONNECTION_STATUS, (status) => {
  if (status === 'connected') {
    setLightColor('white')
  } else if (status === 'disconnected') {
    setLightColor('red')
  }
})
