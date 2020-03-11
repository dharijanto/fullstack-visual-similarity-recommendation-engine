import * as fs from 'fs'

import * as express from 'express'
import * as _ from 'lodash'
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
      const pageSize = 150
      const pageLength = files.length / pageSize + (files.length % pageSize > 0 ? 1 : 0)

      const reverseFileMap = {}
      const fileMap = files.sort().reduce((acc, filename, index) => {
        acc[filename] = index
        reverseFileMap[index] = filename
        return acc
      }, {})

      // Randomize the ordering
      files = _.shuffle(files)

      if (err) {
        this.routeGet('*', (req, res, next) => {
          res.status(500).send('Failed to load assets: ' + err.message)
        })
      } else {
        this.routeGet('/', (req, res, next) => {
          res.redirect('/1')
        })
        this.routeGet('/:pageId', (req, res, next) => {
          const pageId = parseInt(req.param('pageId', 1), 10)
          const start = pageId - 1 * pageSize
          const end = start + 50 + 1
          res.locals.sortedFiles = files.slice(start, end)
          res.locals.pages = _.range(1, pageLength + 1)
          res.render('home')
        })

        this.routeGet('/visually-similar/:filename', (req, res, next) => {
          const COSINE_SIM = require(AppConfig.SIMILARITY_MATRIX_PATH)
          const filename = req.param('filename', null)
          if (filename) {
            const similar = COSINE_SIM[fileMap[filename]]
            if (similar) {
              const filenames = similar.map((value, index) => {
                return [value, index]
              }).sort((a, b) => b[0] - a[0]).slice(1, 10).map(pair => reverseFileMap[pair[1]])
              res.json({ status: true, data: filenames })
            } else {
              res.json({ status: false, errMessage: 'invalid filename@' })
            }
          } else {
            res.json({ status: false, errMessage: 'filename is required!' })
          }
        })
      }
    })

  }
}

module.exports = Controller
