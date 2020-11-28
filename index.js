import 'babel-polyfill'
import openSocket from 'socket.io-client'
import SerialPort from 'serialport'

const SERVER_IP_ADDRESS = 'http://192.168.1.161:3001'

const SERIAL_PORT = '/dev/ttyUSB0'

const socket = openSocket(SERVER_IP_ADDRESS)

const serial = new SerialPort(SERIAL_PORT, { baudRate: 115200, autoOpen: true }, error => { console.log('CALLBACK', error) })


socket.on('connect', () => {
  console.log('connected')
  socket.emit('connect_rover')
})

socket.on('disconnected', () => {
  console.log('disconnected')
})

socket.on('command', ({ type, command }) => {
  console.log('command', type)
  if (type === 'motors') {
    serial.write(JSON.stringify(command), 'ascii', error => { console.log('RESPONSE', error) })
  } else if (type === 'kill') {
    serial.write(JSON.stringify({ A: 0, B: 0 }), 'ascii')
  }
})