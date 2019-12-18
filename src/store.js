import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';
import axios from './axios-auth';
import globalAxios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  getters: {
    user(state) {
      return state.user;
    },
    isAuthenticated(state) {
      return state.idToken !== null;
    }
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser(state, user) {
      state.user = user;
    },
    clearAuthData(state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    signup({commit, dispatch}, authData) {
      axios.post('/accounts:signUp?key=AIzaSyDbG0tzqyGiPTbWjM8AGpP_ZsM_l3Ty_GI', {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });
          
          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);

          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.userId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('storeUser', {authData});
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(error => console.log(error));
    },
    login({commit, dispatch}, authData) {
      axios.post('/accounts:signInWithPassword?key=AIzaSyDbG0tzqyGiPTbWjM8AGpP_ZsM_l3Ty_GI', {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        })
        .then(res => {
          console.log(res);
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });

          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(error => console.log(error));
    },
    tryAutoLogin({commit}) {
      const token = localStorage.getItem('token');
      if (!token) {
        return
      }
      const expirationDate = localStorage.getItem('expirationDate');
      const now = new Date();
      if (now >= expirationDate) {
        return
      }
      const userId = localStorage.getItem('userId');
      commit('authUser', {
        token: token,
        userId: userId
      })
    },
    logout({commit}) {
      commit('clearAuthData');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      router.replace('/signin');
    },
    setLogoutTimer({
      commit
    }, expirationTime) {
      setTimeout(() => {
        commit('clearAuthData');
      }, expirationTime * 1000);
    },
    storeUser({commit, state}, userData) {
      if (!state.idToken) {
        return;
      }
      globalAxios.post(`/users.json?auth=${state.idToken}`, userData)
        .then(res => {
          console.log(res);
        })
        .catch(error => console.log(error));
    },
    fetchUser({commit, state}) {
      if (!state.idToken) {
        return;
      }
      globalAxios.get(`/users.json?auth=${state.idToken}`)
        .then(res => {
          console.log(res);
          const data = res.data;
          const users = []
          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }
          console.log(users);
          commit('storeUser', users[0]);
        })
        .catch(error => console.log(error));
    }
  }
})
