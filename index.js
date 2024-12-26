import 'babel-polyfill'
import openSocket from 'socket.io-client'
import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { Gpio } from 'onoff'

const SERVER_IP_ADDRESS = 'http://192.168.0.85:3001'

const SERIAL_PORT = '/dev/ttyUSB0'

const RED_PIN = 17
const GREEN_PIN = 27
const BLUE_PIN = 22

const redLight = new Gpio(RED_PIN, 'out')
const greenLight = new Gpio(GREEN_PIN, 'out')
const blueLight = new Gpio(BLUE_PIN, 'out')

redLight.writeSync(0)
greenLight.writeSync(0)
blueLight.writeSync(0)

const socket = openSocket(SERVER_IP_ADDRESS)

const RESPONSE_TYPE = {
  INFORMATION: 'information',
  STATE_UPDATE: 'state-update'
}

const serial = new SerialPort(SERIAL_PORT, { baudRate: 115200, autoOpen: true }, error => { console.log('CALLBACK', error) })

const parser = serial.pipe(new Delimiter({ delimiter: '\n' }))

socket.on('connect', () => {
  console.log('connected')
  redLight.writeSync(1)
  greenLight.writeSync(1)
  blueLight.writeSync(1)

  socket.emit('connect_rover')

  parser.on('data', data => {
    const json = JSON.parse(data.toString())
    const responseType = json['type']
    
    delete json['type']

    if (responseType === RESPONSE_TYPE.STATE_UPDATE) {
      socket.emit('rover_data', json)
    }
  })
})

socket.on('disconnected', () => {
  console.log('disconnected')
})

socket.on('command', ({ type, command }) => {
  console.log('command', type, command)
  if (type === 'motors') {
    serial.write(JSON.stringify(command), 'ascii', error => { console.log('RESPONSE', error) })
  } else if (type === 'kill') {
    serial.write(JSON.stringify({ A: 0, B: 0 }), 'ascii')
  } else if (type ==='color') {
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
    }
  }
})