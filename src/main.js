import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import Vuelidate from 'vuelidate';

Vue.config.productionTip = false;

Vue.use(Vuelidate);

axios.defaults.baseURL = 'https://vue-axios-b9674.firebaseio.com';
// axios.defaults.headers.common['Authorization'] = 'qwerty';
axios.defaults.headers.get['Accepts'] = 'application/json';

const requestInterceptor = axios.interceptors.request.use(config => {
  console.log('Request Interceptor', config);
  return config;
});
const responseInterceptor = axios.interceptors.response.use (res => {
  console.log('Response Interceptor', res);
  return res;
});

axios.interceptors.request.eject(requestInterceptor);
axios.interceptors.response.eject(responseInterceptor);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
