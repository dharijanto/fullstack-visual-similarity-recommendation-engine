import * as path from 'path'
import * as assert from 'assert'
import * as process from 'process'

import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'
import * as pretry from 'bluebird-retry'

import * as AppConfig from '../app-config'
import SequelizeService from '../services/sequelize-service'

const createModel = require('../db-structure')
// const createModel = require(path.join('../../db-structure'))

before(function (done) {
  const sequelize = new Sequelize(AppConfig.TEST_SQL_DB, { logging: !!process.env.DEBUG_SQL, operatorsAliases: false })
  const models = createModel(sequelize, {})
  SequelizeService.initialize(sequelize, models)
  SequelizeService.getInstance().sequelize.sync().then(() => {
    done()
  })
})

after(function (done) {
  SequelizeService.getInstance().close()
  done()
})
