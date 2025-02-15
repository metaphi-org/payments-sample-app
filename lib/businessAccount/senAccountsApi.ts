import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreateSenAccountPayload {
  idempotencyKey: string
  accountNumber: string
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios reponses and maps
 * to errorHandler object
 */
instance.interceptors.response.use(
  function (response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    return response
  },
  function (error) {
    let response = get(error, 'response')
    if (!response) {
      response = error.toJSON()
    }
    return Promise.reject(response)
  }
)

const nullIfEmpty = (prop: string | undefined) => {
  if (prop !== undefined && prop.trim() === '') {
    return undefined
  }
  return prop
}

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create sen business account
 * @param {*} payload (contains form data)
 */
function createSenBusinessAccount(payload: CreateSenAccountPayload) {
  const url = '/v1/businessAccount/banks/sen'
  return instance.post(url, payload)
}

/**
 * Get sen business accounts
 */
function getSenBusinessAccounts() {
  const url = '/v1/businessAccount/banks/sen'
  return instance.get(url)
}

/**
 * Get sen business account by id
 * @param {String} accountId
 */
function getSenBusinessAccountById(accountId: string) {
  const url = `/v1/businessAccount/banks/sen/${accountId}`
  return instance.get(url)
}

/**
 * Get sen business account instructions
 * @param {String} accountId
 */
function getSenBusinessAccountInstructions(
  accountId: string,
  currency: string
) {
  const url = `v1/businessAccount/banks/sen/${accountId}/instructions`
  const queryParams = {
    currency: nullIfEmpty(currency),
  }
  return instance.get(url, { params: queryParams })
}

export default {
  getInstance,
  createSenBusinessAccount,
  getSenBusinessAccounts,
  getSenBusinessAccountById,
  getSenBusinessAccountInstructions,
}
