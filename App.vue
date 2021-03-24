<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			plus.screen.lockOrientation("portrait-primary");
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="less">
	@import url('./static/css/style.less');
	
</style>
