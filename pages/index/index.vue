<template>
	<view class="content">
		<button type="primary" @click="getData">fade</button>
		<image class="logo" src="/static/logo.png"></image>
		<li v-for="(item, index) in bluetooth" :key="item.deviceId" @click="createBLEConnection(item.deviceId,index)">
			<div>{{index + 1}}</div>
			<span>deviceId:{{item.deviceId}}</span><br>
			<span v-if="item.name == 'JH908'" style="color: red;font-size: 20px;">名称:{{item.name}}</span><br>
			<span v-if="item.name !== 'JH908'">名称:{{item.name}}</span><br>
			<span>强度:{{item.RSSI}}</span>
			<view v-if="isLink[index]==0" class="ft-color-red ft-28 ft-color-999999">未连接</view>
			<view v-if="isLink[index]==1" class="ft-color-red ft-28 ft-color-999999">连接中...</view>
			<view v-if="isLink[index]==2" class="ft-color-red ft-28 ft-color-green ft-color-999999">已连接</view>
			<view v-if="isLink[index]==3" class="ft-color-red ft-28 ft-color-green ft-color-999999">连接失败</view>
			<view v-if="isLink[index]==4" class="ft-color-red ft-28 ft-color-green ft-color-999999">已断开</view>
		</li>
	</view>
</template>

<script>
	import {uniBadge} from '@dcloudio/uni-ui'
	//import uniBadge from '@dcloudio/uni-ui/lib/uni-badge/uni-badge.vue' //也可使用此方式引入组件
	
	export default {
		data() {
			return {
				bluetooth: [],
				isLink: [],
				serverList: [],
				characteristics: [],
				deviceId: '',
				serviceId: '',
				characteristicId: '',
				isOpenBle: false,
			}
		},
		components: {uniBadge},
		onLoad() {
			//在页面加载时候初始化蓝牙适配器
            uni.openBluetoothAdapter({
                success: e => {
                    console.log('初始化蓝牙成功:' + e.errMsg);
                    this.$data.isOpenBle = true;
                    // 初始化完毕开始搜索
                    this.startBluetoothDeviceDiscovery()
                },
                fail: e => {
                    console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
                }
            });
		},
		methods: {
			getData(){
				this.server.seasons().then(res => {
				})
			},
			startBluetoothDeviceDiscovery() {
                //在页面显示的时候判断是都已经初始化完成蓝牙适配器若成功，则开始查找设备
                let self = this;
                setTimeout(function() {
                    if (self.isOpenBle) {
                        console.log("开始搜寻智能设备");
                        uni.startBluetoothDevicesDiscovery({
                            success: res => {
                                self.onBluetoothDeviceFound();
                            },
                            fail: res => {
                                uni.showToast({
                                    icon: "none",
                                    title: "查找设备失败！",
                                    duration: 3000
                                })
                            }
                        });
                    } else {
                        console.log("未初始化蓝牙是配饰器：" + self.isOpenBle);
                    }
                }, 300);
            },
            /**
             * 停止搜索蓝牙设备
             */
            stopBluetoothDevicesDiscovery() {
                uni.stopBluetoothDevicesDiscovery({
                    success: e => {
                        console.log('停止搜索蓝牙设备:' + e.errMsg);
                    },
                    fail: e => {
                        console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
                    }
                });
            },
            /**
             * 发现外围设备
             */
            onBluetoothDeviceFound() {
                uni.onBluetoothDeviceFound(devices => {
                    this.getBluetoothDevices();
                });
            },
            /**
             * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
             */
            getBluetoothDevices() {
                uni.getBluetoothDevices({
                    success: res => {
						// console.log(res)
						this.bluetooth = res.devices;
						this.bluetooth.forEach((item)=>{
							this.isLink.push(0)
						})
                    }
                });
            },
			//断开蓝牙连接
			closeBLEConnection(deviceId,index){
				uni.closeBLEConnection({
				  deviceId:deviceId,
				  success:res=> {
					  this.isLink.splice(index,1,4)
					console.log(res)
				  }
				})
			},
			// 连接蓝牙设备
			createBLEConnection(deviceId,index){
				this.deviceId = deviceId;
				if(this.isLink[index] == 2){
					//this.closeBLEConnection(deviceId,index);
					return;
				}
				this.isLink.splice(index,1,1)
				uni.createBLEConnection({
				  deviceId:this.deviceId,
				  success:res=> {
					console.log(res)
					this.isLink.splice(index,1,2)
					this.stopBluetoothDevicesDiscovery();
					this.getBLEDeviceServices(this.deviceId,index);
				  },
				  fail:res=> {
					this.isLink.splice(index,1,3)
					console.log(res)
				  }
				})	
			},
			//获取蓝牙设备所有服务(service)。
			getBLEDeviceServices(deviceId,index){
				setTimeout(()=>{
					uni.getBLEDeviceServices({
					  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					  deviceId:deviceId,
					  success:(res)=>{
						console.log('device services:', res)
						this.serverList = res.services
						res.services.forEach((item)=>{
							this.serviceId = item.uuid;
							this.getBLEDeviceCharacteristics(this.deviceId)
						})
					  }
					})
				},3000)
			},
			// 获取蓝牙特征值
			getBLEDeviceCharacteristics(deviceId){
				console.log("进入特征");
				setTimeout(()=>{
					uni.getBLEDeviceCharacteristics({
					  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					  deviceId:deviceId,
					  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					  serviceId:this.serviceId,
					  success:(res)=>{
						console.log('------------------------------',res)
						this.characteristics = res.characteristics;
						res.characteristics.forEach((item)=>{
							if(item.uuid.indexOf("FF01")!=-1 || item.uuid.indexOf("FF02")!=-1){
								this.characteristicId = item.uuid;
								console.log('characteristicId:', this.characteristicId)
								this.notifyBLECharacteristicValueChange(this.deviceId)
							}
						})
					  },
					  fail:(res)=>{
						console.log(res)
					  }
					})
				},2000)
			},
			// 启用 notify 功能
			notifyBLECharacteristicValueChange(deviceId){
				uni.notifyBLECharacteristicValueChange({
				  state: true, // 启用 notify 功能
				  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				  deviceId:deviceId,
				  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				  serviceId:this.serviceId,
				  // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				  characteristicId:this.characteristicId,
				  success:(res)=> {
					console.log('notifyBLECharacteristicValueChange success', res.errMsg)
					this.onBLECharacteristicValueChange(this.deviceId);
				  },
				  fail:(res)=> {
					console.log('notifyBLECharacteristicValueChange success', res.errMsg)
				  }
				})
			},
			ab2hex(buffer) {
			  const hexArr = Array.prototype.map.call(
				new Uint8Array(buffer),
				function (bit) {
				  return ('00' + bit.toString(16)).slice(-2)
				}
			  )
			  return hexArr.join('')
			},
			// 监听低功耗蓝牙设备的特征值变化
			onBLECharacteristicValueChange(deviceId){
				uni.onBLECharacteristicValueChange((res)=> {
				  console.log(this.ab2hex(res.value))
				  this.macAddress = res.deviceId;
				  this.macValue = this.ab2hex(res.value);
				  this.readBLECharacteristicValue(this.deviceId)
				})	
			},
			// 读取设备二进制数据
			readBLECharacteristicValue(){
				console.log('进入读取');
				setTimeout(()=>{
					uni.readBLECharacteristicValue({
					  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					  deviceId:this.deviceId,
					  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					  serviceId:this.serviceId,
					  // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
					  characteristicId:this.characteristicId,
					  success:(res)=> {
						 console.log('readBLECharacteristicValue:', res)
						 // this.onBLECharacteristicValueChange(this.deviceId);
					  },
					  fail:(res)=> {
						 console.log('readBLECharacteristicValue2:', res)
						 // this.onBLECharacteristicValueChange(this.deviceId);
					  }
					})
				},200)
			},
			// 发送二进制数据
			writeBLECharacteristicValue(){
				let buffer = new ArrayBuffer(this.value)
				const dataView = new DataView(buffer)
				dataView.setUint8(0, 0)
				uni.writeBLECharacteristicValue({
				  // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
				  deviceId:this.deviceId,
				  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				  serviceId:this.serviceId,
				  // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
				  characteristicId:this.characteristicId,
				  // 这里的value是ArrayBuffer类型
				  value: buffer,
				  success:(res)=> {
					this.returnMessage = res.errMsg;
					console.log('writeBLECharacteristicValue success', res)
				  },
				  fail:(res)=> {
					this.returnMessage = res.errMsg;
					console.log('writeBLECharacteristicValue success', res)
				  }
				})				
			}
		}
	}
</script>

<style>
	.content {
		width: 100%;
		height: 100%;
		overflow: auto;
		text-align: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 50rpx auto;
	}
</style>
