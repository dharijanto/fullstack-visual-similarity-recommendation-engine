import * as fs from 'fs'

import * as express from 'express'
import * as Promise from 'bluebird'
import * as sharp from 'sharp'

import * as AppConfig from '../app-config'
import BaseController from './controllers/base-controller'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'
import * as Utils from '../libs/utils'
import PassportManager from './libs/passport-manager'

const path = require('path')

let log = require('npmlog')
log.level = 'debug'

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    // Full resolution images
    this.routeUse(AppConfig.IMAGE_MOUNT_PATH, express.static(AppConfig.IMAGE_PATH, { maxAge: AppConfig.ENABLE_MAX_AGE_CACHING ? '1h' : '0' }))

    // Iterate through all images
    fs.readdir(path.join(AppConfig.IMAGE_PATH, 'lanecrawford'), (err, files) => {
      const sortedFiles = files.sort()
      const fileMap = sortedFiles.reduce((acc, value, index) => {
        acc[value] = index
        return acc
      }, {})

      if (err) {
        this.routeGet('*', (req, res, next) => {
          res.status(500).send('Failed to load assets: ' + err.message)
        })
      } else {
        this.routeGet('/', (req, res, next) => {
          res.locals.sortedFiles = sortedFiles.slice(0,100)
          res.render('home')
        })
      }
    })

  }
}

module.exports = Controller
