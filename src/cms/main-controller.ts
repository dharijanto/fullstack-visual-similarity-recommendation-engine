import * as log from 'npmlog'
import * as Promise from 'bluebird'

import * as ApplicationHelper from '../libs/application-helper'
import BaseController from './controllers/base-controller'

import { SiteData, ImageService } from '../site-definitions'
import * as Utils from '../libs/utils'

import * as AppConfig from '../app-config'

const TAG = 'MainController'
class MainController extends BaseController {
  private imageService: ImageService
  private readonly imageURLFormatter

  constructor (initData: SiteData) {
    super(initData)
    this.imageService = new initData.services.ImageService(initData.db.sequelize, initData.db.models)
    this.imageURLFormatter = (imageFilename) => Utils.getImageURL(imageFilename, true)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      res.locals.siteHash = this.siteHash

      res.locals.__sidebar = []

      // Cloud-only menu
      if (ApplicationHelper.getServerType() !== 'ON_PREMISE' || !AppConfig.PRODUCTION) {
        res.locals.__sidebar.push({ title: 'Product Management', url: `/${this.siteHash}/`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Shop Management', url: `/${this.siteHash}/shop-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Supplier Management', url: `/${this.siteHash}/supplier-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Promotion Management', url: `/${this.siteHash}/shop-management/promotion-management`, faicon: '' })
        res.locals.__sidebar.push({ title: 'Order Management', url: `/${this.siteHash}/order-management/`, faicon: '' })
      }

      // Local-only menu
      if (ApplicationHelper.getServerType() === 'ON_PREMISE' || !AppConfig.PRODUCTION) {
        res.locals.__sidebar.push({ title: 'Account Management', url: `/${this.siteHash}/account-management/`, faicon: '' })
      }

      // Menu for both local and cloud
      res.locals.__sidebar.push({ title: 'Populate Views', url: `/${this.siteHash}/populate-views`, faicon: '' })
      res.locals.__sidebar.push({ title: 'Reindex Search Cache', url: `/${this.siteHash}/reindex-search-database`, faicon: '' })
      next()
    })

    this.routePost('/image/get-url', (req, res, next) => {
      const filename = req.body.filename
      res.json({ status: true, data: Utils.getImageURL(filename, true) })
    })

    super.routeGet('/images', (req, res, next) => {
      const tag = req.query.tag
      this.imageService.getImages(this.imageURLFormatter, tag).then(resp => {
        log.verbose(TAG, '/images.GET():' + JSON.stringify(resp))
        res.json(resp)
      }).catch(next)
    })

    super.routePost('/image', (req, res, next) => {
      const tag = req.query.tag
      this.imageService.getExpressUploadMiddleware(
        AppConfig.IMAGE_PATH, this.imageURLFormatter, undefined, undefined, tag)(req, res, next)
    })

    super.routePost('/image/delete', (req, res, next) => {
      log.verbose(TAG, 'image/delete.POST: req.body=' + JSON.stringify(req.body))
      this.imageService.deleteImage(AppConfig.IMAGE_PATH, req.body.filename).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    this.routeGet('/', (req, res, next) => {
      res.locals.renderSidebar = true
      res.render('product-management')
    })

    this.routeGet('/populate-views', (req, res, next) => {
      /* SQLViewService.populateViews().then(resp => {
        res.json(resp)
      }).catch(next) */
    })

  }
}

module.exports = MainController
