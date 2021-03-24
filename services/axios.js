import axios from 'axios';

//正式地址
// export let baseURL = 'https://guoan.acme-ai.net/api/webapi/soccer';
//测试地址
export let baseURL = 'https://guoan.test.acme-ai.net/api/webapi/soccer';

// 添加请求拦截器 
let tokenA = '';
var CancelToken = axios.CancelToken;
axios.defaults.baseURL = baseURL;

axios.interceptors.request.use(function(config) {
	let store = uni.getStorageSync("store");
	if (store !== null && store && store != "") {
		tokenA = 'Bearer ' + JSON.parse(store).userData.token;
	}
	config.headers.Authorization = tokenA;
	if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
		// POST传参序列化
		if (config.data.body && config.data.url) {
			config.data = config.data.body;
			config.params = config.params.url;
		} else if (!config.data.body && config.data.url) {
			config.data = {};
			config.params = config.params.url;
		} else {
			config.params = {}
		}
	
	}
	return config;
}, function(error) {
	// 预处理请求错误（error）
	return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
	// 预处理响应数据（response）如果数据当中有不要的部分，就截留
	return response.data;
}, function(error) {
	// 预处理响应错误（error)
	console.log(error)
	
	let store = uni.getStorageSync("store");
	
	if (error.response.status == 403 && error.response) {
		uni.showToast({
			icon: 'none',
			title: 'token失效，请重新登录',
			duration: 2000
		});
		setTimeout(function() {
			uni.switchTab({
				url: `/pages/login/index`
			})
		}, 500);
	} else if (error.response.status == 401 || error.response.status == 500) {
		if ( !store && JSON.parse(store).userData != null && !/login/.test(error.response.config.url)) return Promise.reject(error);
		uni.showToast({
			icon: 'none',
			title: error.response.data.message,
			duration: 2000
		});
	} else {
		uni.showToast({
			icon: 'none',
			title: error.response,
			duration: 2000
		});
	}
	return Promise.reject(error);
});

axios.defaults.adapter = function(config) { //自己定义个适配器，用来适配uniapp的语法
	return new Promise((resolve, reject) => {
		// console.log(config)
		var settle = require('axios/lib/core/settle');
		var buildURL = require('axios/lib/helpers/buildURL');
		uni.request({
			method: config.method.toUpperCase(),
			url: config.baseURL + buildURL(config.url, config.params, config.paramsSerializer),
			header: config.headers,
			data: config.data,
			dataType: config.dataType,
			responseType: config.responseType,
			sslVerify: config.sslVerify,
			complete: function complete(response) {
				// console.log("执行完成：",response)
				response = {
					data: response.data,
					status: response.statusCode,
					errMsg: response.errMsg,
					header: response.header,
					config: config
				};

				settle(resolve, reject, response);
			}
		})
	})
}
export default function(url, {
	// 不传时，默认参数
	method = 'get',
	timeout = 10000,
	data = {},
	cancelToken = '',
	headers = {
		'Content-Type': 'application/json'
	}, // application/x-www-form-urlencoded;charset=UTF-8;
	responseType = 'json'
}) {
	const config = {
		method: method,
		timeout: timeout,
		url: url, // 如果URL是完整的，包含域名，则下方的域名不会被拼接
		// baseURL: baseUrl.URL_CNODEJS, // 域名，在最外层的config.js当中可以修改，请求目标服务器域名配置，结合我们自己的项目，在项目放置到服务器上时，就是将域名替换成192.168.1.3
		data: data,
		params: data,
		canelToken: cancelToken, // 关闭请求
		headers: headers,
		responseType: responseType
	};
	return axios(config);
}

export let defultURL = baseURL;
