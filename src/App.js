import React, { Component } from 'react'
import TableauConnectorForm from './components/TableauConnectorForm'
import NotTableauView from './components/NotTableauView'
import LoginForm from './components/LoginForm'
import TableauConnector from './TableauConnector'
import queryString from 'query-string'

const tableau = window.tableau
const connector = new TableauConnector()

class App extends Component {

  constructor () {
    super()
    this.parsedQueryString = queryString.parse(location.search)
    let { dataset_name } = this.parsedQueryString
    if (dataset_name) {
      this.storeDataset(dataset_name)
    } else {
      dataset_name = this.getDataset()
    }

    this.isTableau = navigator.userAgent.toLowerCase().indexOf('tableau') >= 0 || this.parsedQueryString.forceTableau

    this.state = {
      apiKey: this.getApiKey(),
      datasetName: dataset_name
    }
    this.clearApiKey = this.clearApiKey.bind(this)
  }

  apiKeyHasExpired (apiKey) {
    try {
      const decoded = JSON.parse(atob(apiKey.split('.')[1]))
      const expirationTimeInMilliseconds = decoded.exp * 1000
      if (expirationTimeInMilliseconds < new Date().getTime()) {
        return true
      }
      return false
    } catch (error) {
      tableau.log('There was an error decoding a JWT token')
      tableau.log(error)
      return true
    }
  }

  getApiKey () {
    // the OAuth flow will return the token in the query string
    if (this.parsedQueryString.token) {
      this.storeApiKey(this.parsedQueryString.token)
      return this.parsedQueryString.token
    }
    if (window.localStorage) {
      let apiKey = window.localStorage.getItem('DW-API-KEY')
      if (apiKey && this.apiKeyHasExpired(apiKey)) {
        apiKey = null
      }
      return apiKey
    }
    return
  }

  storeApiKey (key) {
    if (window.localStorage) {
      window.localStorage.setItem('DW-API-KEY', key)
    }
  }

  getDataset () {
    if (window.localStorage) {
      return window.localStorage.getItem('DW-DATASET-NAME')
    }
    return
  }

  storeDataset (key) {
    if (window.localStorage) {
      window.localStorage.setItem('DW-DATASET-NAME', key)
    }
  }

  clearApiKey () {
    this.setState({
      apiKey: null
    })
    this.storeApiKey('')
  }

  render () {
    const { apiKey, datasetName } = this.state
    const dataset = datasetName ? `https://data.world/${datasetName}` : null

    if (! this.isTableau) {
      return (<NotTableauView />)
    }

    return (
      (apiKey
        ? <TableauConnectorForm connector={connector} dataset={dataset} apiKey={apiKey} clearApiKey={this.clearApiKey} />
        : <LoginForm />)
    )
  }
}

export default App
