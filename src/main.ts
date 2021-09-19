import './styles/common.css'

import { createApp } from 'vue'
import App from './App.vue'
import { store } from './store'
import { i18n } from '@/i18n'
import NP from 'number-precision'
import installAntDesign from './plugins/ant-design-vue'

// 引入测试用样式
if (process.env.NODE_ENV !== 'production') {
  require('./styles/test.css')
}

// If you want to get rid of XXX is beyond boundary when transfer to integer, the results may not be accurate, use this at the beginning of your app to turn off boundary checking.
// https://github.com/nefe/number-precision#usage
NP.enableBoundaryChecking(false) // default param is true

const app = createApp(App)
installAntDesign(app)
app.use(store).use(i18n).mount('#app')
