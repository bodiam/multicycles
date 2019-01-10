import Vue from 'vue'
import Vuex from 'vuex'
import gql from 'graphql-tag'

import i18n from './i18n'
import apolloProvider from './apollo'
import getlanguage from './language'

Vue.use(Vuex)

const disabledProviders =
  localStorage.getItem('disabledProviders') && JSON.parse(localStorage.getItem('disabledProviders'))
const position = localStorage.getItem('position') && JSON.parse(localStorage.getItem('position'))

const state = {
  lang: getlanguage(),
  geolocation: position || [48.852775, 2.369336],
  providers: [],
  disabledProviders: disabledProviders || [],
  selectedVehicle: false,
  drawerEnable: true,
  moved: false,
  map: {
    center: position || [48.852775, 2.369336]
  },
  selectedAddress: {
    name: ''
  }
}

const getters = {
  isProviderDisabled: state => provider => state.disabledProviders.includes(provider),
  enabledProviders: state => [...state.providers].filter(provider => !state.disabledProviders.includes(provider)),
  drawerEnable: state => state.drawerEnable
}

const actions = {
  setLang({ commit }, event) {
    commit('setLang', event.target.value)
  },
  setGeolocation({ commit }, position) {
    commit('setGeolocation', position)
  },
  getProviders({ state, commit }, position) {
    apolloProvider.defaultClient
      .query({
        query: gql`
          query {
            providers {
              name
              slug
            }
          }
        `
      })
      .then(result => {
        commit('setProviders', result.data.providers)
      })
  },
  toggleProvider({ commit }, provider) {
    commit('toggleProvider', provider)
  },
  selectVehicle({ commit }, vehicle) {
    if (!vehicle) {
      commit('selectVehicle', null)
    } else if (!state.selectedVehicle || vehicle.id !== state.selectedVehicle.id) {
      commit('selectVehicle', null)
      setTimeout(() => {
        commit('selectVehicle', vehicle)
      }, 100)
    }
  },
  setDrawerEnable({ commit }, enable) {
    commit('drawerEnable', !!enable)
  },
  centerOnGeolocation({ commit }) {
    commit('centerOnGeolocation')
    commit('clearAddress')
  },
  setMoved({ commit }, moved) {
    commit('setMoved', moved)
  },
  setCenter({ commit }, center) {
    commit('setCenter', center)
  },
  setAddress({ commit }, address) {
    commit('setAddress', address)
  }
}

const mutations = {
  setLang(state, lang) {
    localStorage.setItem('lang', lang)
    i18n.locale = lang
    state.lang = lang
  },
  setGeolocation(state, position) {
    localStorage.setItem('position', JSON.stringify(position))
    state.geolocation = position
  },
  setProviders(state, providers) {
    state.providers = providers
  },
  toggleProvider(state, provider) {
    if (state.disabledProviders.includes(provider)) {
      state.disabledProviders.splice(state.disabledProviders.indexOf(provider), 1)
    } else {
      state.disabledProviders.push(provider)
    }

    localStorage.setItem('disabledProviders', JSON.stringify(state.disabledProviders))
  },
  selectVehicle(state, vehicle) {
    state.selectedVehicle = vehicle
  },
  drawerEnable(state, enable) {
    state.drawerEnable = enable
  },
  centerOnGeolocation(state) {
    const geolocation = state.geolocation

    if (geolocation) {
      state.moved = false
      state.map.center = JSON.parse(JSON.stringify(geolocation))
    }
  },
  setMoved(state, moved) {
    state.moved = moved
  },
  setCenter(state, center) {
    state.map.center = center
  },
  setAddress(state, address) {
    const position = address.geometry.coordinates
    state.selectedAddress = { name: address.place_name, position: position.reverse() }
  },
  clearAddress(state) {
    state.selectedAddress = { name: '' }
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
