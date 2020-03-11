import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import 'nc-image-picker'
import 'nc-input-library'
import Config from '../config'

let aisle: Aisle

$(document).ready(() => {
  const ncAisle = $('#aisle').NCInputLibrary({
    design: {
      title: 'Aisle Management'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'text' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/cms/stock-management/aisles` ,
        numColumn: 3,
        onRowClicked: (data: Aisle) => {
          aisle = data
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => `/cms/stock-management/aisle` },
        { id: 'edit', desc: 'Edit', postTo: () => `/cms/stock-management/aisle/edit`, confirm: 'Are you sure?' },
        { id: 'delete', desc: 'Delete', postTo: () => `/cms/stock-management/aisle/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })

  ncAisle.reloadTable()
})
