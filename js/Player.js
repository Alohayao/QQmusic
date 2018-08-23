(function(window){
	function Player($audio) {
		this.$audio = $audio;
		this.audio = $audio.get(0);
		this.currentInxex = -1;
		this.musicList = [];
	}
	Player.prototype = {
		constructor: Player,
		//播放音乐方法
		playMusic: function(index, musicInfo) {
			//播放选中音乐
			this.currentIndex = index;
			this.$audio.attr('src', musicInfo.link_url);
			this.audio.play();					
		},

		//自动播放下一曲
		autoPlayNext: function($next) {
			this.$audio.on('ended', function() {
				$next.trigger('click'); 
			})
		},
		//同步播放时间
		musicPlayTime: function(playProgress,callback) {
			var player = this;
			this.$audio.on('timeupdate', function(){
				//没有拖动时显示播放事件，拖动进度条时显示拖动的时间
				var playTime =  playProgress.isMove ? playProgress.dragScale * this.duration :this.currentTime ;
				callback(player.formatTime(playTime));
				
				//歌曲播放时拖动进度条不改变播放进度
				if(!playProgress.isMove) {
					playProgress.progressDot(player.audio);
				}
			});
	    },
		//时间格式化
	    formatTime: function(time) {
			var minutes = Math.floor(time / 60);
			var seconds = Math.floor(time % 60);
			if(minutes < 10){
				minutes = '0' + minutes;
				if(seconds < 10) {
					seconds = '0' + seconds;
				}
			}
			return `${minutes}:${seconds}`;		
		}
	}
		
	window.Player = Player;
})(window);






