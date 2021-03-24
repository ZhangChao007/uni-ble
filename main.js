import Vue from 'vue';
import App from './App';
import server from './services/server';

Vue.config.productionTip = false

App.mpType = 'app';

Vue.prototype.server = server;

const app = new Vue({
    ...App
})
app.$mount()
