import axios from './axios';
import $axios from 'axios'

const server = {
	pushImgOss(data) { //上传人脸识别图片
		let instance = $axios.create({});
		return instance.post('/search_face', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			}
		})
	},
	seasons(data) { //赛季
		return axios('/seasons', {
			method: 'get',
			data: data
		})
	},
	injuryStaff(data, Id) { // 更新用户信息
		return axios('/update_user?userId=' + Id, {
			method: 'post',
			data: data
		})
	},
	formData(url, data) { //formData传参
		let store = uni.getStorageSync("store");
		let tokenA = "";
		if (store) {
			tokenA = "Bearer " + JSON.parse(store).userData.token;
		}
		let instance = $axios.create({});
		instance.interceptors.response.use(function(response) {
			response.dataType = "json";
			return response.data;
		}, function(error) {
			// 预处理响应错误（error)
			if (error.response.status == 403) {
				uni.showToast({
					icon: 'none',
					icon: null,
					title: 'token失效，请重新登录',
					duration: 2000
				});
				setTimeout(function() {
					uni.switchTab({
						url: `/pages/login/index`
					})
				}, 500);
			} else if (error.response.status == 401 || error.response.status == 500) {
				/* Message({
				    message: error.response.data.message,
				    type: "error"
				}); */
				uni.showToast({
					icon: 'none',
					title: error.response.data.message,
					duration: 2000
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: error.response.data.message,
					duration: 2000
				});
			}
			return Promise.reject(error);
		});
		let param = ``;
		for (let i in data) {
			param += i + '=' + data[i] + '&'
		}
		param = param.substring(0, param.length - 1)
		return instance.post(url, param, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
				Authorization: tokenA
			}
		})
	},
}

export default server
