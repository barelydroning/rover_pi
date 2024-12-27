import openSocket from 'socket.io-client'
import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { EventEmitter } from 'events'

const SERVER_IP_ADDRESS = 'http://192.168.0.85:3001'
const SERIAL_PORT = '/dev/ttyUSB0'

const RESPONSE_TYPE = {
  INFORMATION: 'information',
  STATE_UPDATE: 'state-update'
}

export const EVENTS = {
  CONNECTION_STATUS: 'connectionStatus',
  COLOR_CHANGE: 'colorChange',
  COMMAND: 'command',
}

class RoverServer extends EventEmitter {
  constructor() {
    super()
    this.socket = openSocket(SERVER_IP_ADDRESS)
    this.serial = new SerialPort(SERIAL_PORT, { baudRate: 115200, autoOpen: true }, error => { 
      if (error) {
        console.error('Serial port connection error:', error)
      }
    })
    this.parser = this.serial.pipe(new Delimiter({ delimiter: '\n' }))
    this.setupEventListeners()
  }

  writeToSerial(data) {
    return new Promise((resolve, reject) => {
      this.serial.write(JSON.stringify(data), 'ascii', error => {
        if (error) {
          console.error('Error writing to serial:', error)
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.emit(EVENTS.CONNECTION_STATUS, 'connected')
      this.socket.emit('connect_rover')

      this.parser.on('data', data => {
        try {
          const json = JSON.parse(data.toString())
          const responseType = json['type']
          delete json['type']

          if (responseType === RESPONSE_TYPE.STATE_UPDATE) {
            this.socket.emit('rover_data', json)
          }
        } catch (error) {
          console.error('Error parsing serial data:', error)
        }
      })
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.emit(EVENTS.CONNECTION_STATUS, 'disconnected')
      this.socket.emit('disconnect_rover')
    })

    this.socket.on('command', ({ type, command }) => {
      console.log('Received command:', type, command)
      this.emit(EVENTS.COMMAND, { type, command })
      this.handleCommand(type, command)
    })
  }

  handleCommand(type, command) {
    switch (type) {
      case 'motors':
        this.writeToSerial(command).catch(error => {
          console.error('Failed to write motor command:', error)
        })
        break
      case 'kill':
        this.writeToSerial({ A: 0, B: 0 }).catch(error => {
          console.error('Failed to write kill command:', error)
        })
        break
      case 'color':
        this.emit(EVENTS.COLOR_CHANGE, command.color)
        break
      default:
        console.warn('Unknown command type:', type)
    }
  }
}

// Create single instance that will persist
const roverServer = new RoverServer()

// Export the singleton instance
module.exports = roverServer