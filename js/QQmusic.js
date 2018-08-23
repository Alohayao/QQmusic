$(function(){
	
	//实例化一个Player
	var $audio = $('audio');
	var audio = $audio.get(0);
	var musicPlayer = new Player($audio);
	
	//歌曲播放进度控制
	var $progressLoad = $('.player_progress_load');
	var $progressPlay = $progressLoad.find('.player_progress_play');
	var $progressDot = $progressPlay.find('.player_progress_dot');
	var playProgress = new Progress($progressLoad, $progressPlay, $progressDot);
	
	playProgress.progressClick(function(scale) {
		setCurrentTime(scale);
	});
	playProgress.progressDrag(function(scale) {
		//屏蔽其他鼠标抬起事件
//		if(!playProgress.isMove) {
//			return;
//		} 
		//点击dot拖动在抬起，修改播放时间
		setCurrentTime(scale);
		
	});
	function setCurrentTime (scale) {
		musicPlayer.audio.currentTime = musicPlayer.audio.duration * scale;
	}
	
	//歌曲声音大小控制
	var $voiceMax = $('.voice_max');
	var $voicePercent = $('.voice_percent');
	var $voiceDot = $('.voice_dot');

	var voiceControl = new Progress($voiceMax, $voicePercent, $voiceDot);
	voiceControl.progressClick(function(scale){
		setVolume(scale);
	});

	//拖动进度条时同时改变音量大小,第一个回调函数不执行
	voiceControl.progressDrag(
		function(scale) {
			return
		},
		function(scale) {
			setVolume(scale);
		}
	);
	function setVolume(scale) {
		audio.volume = scale;
	}
	


	//1.加载音乐
	//1.1加载歌曲列表
	(function getMusic () {
		$.ajax({
			type: "get",
			url: "getjson.php?" + Math.random(),
			cache: false,
			success: function(jsonData) {	
				//同步Player中的歌曲列表
				var data = JSON.parse(jsonData); 
				musicPlayer.musicList = data;
				//获得歌曲列表
				$musicList = $('.music_list');
				//创建歌曲li，并添加到歌曲列表中
				$.each(data, function (index, value) { 
					var $li = createMusicLi(index, value);			
					$musicList.append($li);
				});	
				//加载、添加完成后自动播放第一首歌曲
				$('li.music').eq(0).find('.play').trigger('click');
			},
			error: function(e, status, error) {
				console.log(error);
			}
		});
	})();
	//1.2将从服务器获取的歌曲信息数组逐条填充到创建的歌曲li中
	function createMusicLi(index, value) {
		var $li = $(`
						<li class="music">
							<div class="music_checkbox_border" class="checked">
							
								<i class="fa fa-check"></i>
							</div>
							<div class="music_index">
								${index + 1}
							</div>
							<div class="music_name">
								<span>${value.name}</span>
								<div class="music_module">
									<a href="javascript:;" title="播放" class="play">
										<i class="fa fa-play-circle"></i>
									</a>
									<a href="javascript:;" class="hidden stop" title="暂停" >
										<i class="fa fa-pause "></i>
									</a>
									<a href="javascript:;" title="添加到歌单">
										<i class="fa fa-plus-square-o"></i>
									</a>
									<a href="javascript:;" title="分享">
										<i class="fa fa-download"></i>
									</a>
								</div>
							</div>

							<div class="music_singer">
								<a href="javascript:;">${value.singer}</a>
							</div>
							<div class="music_time">
								<span>${value.time}</span>
								<a href="javascript:;" title="删除" class="music_delete">
									<i class="fa fa-trash"></i>
								</a>
							</div>
						</li>
						<i class="musiclist_line"></i>
					`);	
		$li.get(0).index = index;
		$li.get(0).musicInfo = value;
		return $li;
	}
	
	//显示正在播放的歌曲信息 背景、、、
	function musicInfoChange(musicInfo) {
		//切换专辑背景图片
		$('.music_cover').attr('src', musicInfo.cover);
		//切换背景图片
		$('.bg_cover').css('background', `url(${musicInfo.cover})`);
		//添加歌曲时间、歌手、歌名
		$('.info_right').find('.music_time').text(musicInfo.time);
		$('.info_left').find('.music_name').text(musicInfo.name);
		$('.info_left').find('.music_singer').text(musicInfo.singer);
		
		$('.content_right').find('.music_name').text(musicInfo.name);
		$('.content_right').find('.music_singer').text(musicInfo.singer);
		$('.content_right').find('.music_album').text(musicInfo.album);	
	}


	//2事件监听
	(function eventListner() {
		//2.1鼠标移入、移出事件  
		//移入
		$('.music_list').delegate('li.music', 'mouseenter', function() {
			//鼠标移入每条歌曲li时，对应的控制模块显示
			$(this).find('.music_module').show();
			//显示对应的删除图标
			$(this).find('.music_time i').show();
			//隐藏对应的歌曲时间
			$(this).find('.music_time span').hide();
		});	
		//移出
		$('.music_list').delegate('li.music', 'mouseleave', function() {
			$(this).find('.music_module').hide();
			$(this).find('.music_time i').hide();
			$(this).find('.music_time span').show();
		});
		//2.2歌曲控制模块中播放、停止按钮点击事件
		
		//播放按钮点击		
		$('.mod_musiclist').delegate('.music_module .play', 'click', function(){
			//隐藏播放按钮
			$(this).addClass('hidden');	
			//显示暂停按钮
			$(this).next().removeClass('hidden');
			//歌曲名称高亮
			$(this).parent().prev().addClass('active');
			//其他歌曲li中的播放按钮显示，停止按钮隐藏，歌曲名称不高亮
			$(this).parents('li.music').siblings().find('.music_module .play').removeClass('hidden');
			$(this).parents('li.music').siblings().find('.music_module .stop').addClass('hidden');	
			$(this).parents('li.music').siblings().find('.music_name span').removeClass('active');
			//底部歌曲控制区
			//播放按钮隐藏、暂停按钮显示
			$('.player_control').find('.play').addClass('hidden');
			$('.player_control').find('.stop').removeClass('hidden');
			//播放被点击的当前音乐
			var playMusicLi = $(this).parents('li.music').get(0);
			musicPlayer.playMusic(playMusicLi.index, playMusicLi.musicInfo);
			musicInfoChange(playMusicLi.musicInfo);	
		});
		//停止按钮点击
		$('.mod_musiclist').delegate('.music_module .stop', 'click', function(){
			$(this).addClass('hidden');
			$(this).prev().removeClass('hidden');
			$(this).parent().prev().removeClass('active');
			$('.player_control').find('.stop').addClass('hidden');
			$('.player_control').find('.play').removeClass('hidden');		
			musicPlayer.audio.pause();
		});
		
		//2.3底部歌曲控制区 播放、暂停、下一首、上一首
		//点击播放
		$('.player_control').find('.play').click(function() {	
			//继续播放暂停的歌曲
			musicPlayer.audio.play();
			//歌曲名称高亮
			$('li.music').eq(musicPlayer.currentIndex).find('.music_name span').addClass('active');
			$(this).addClass('hidden');
			$(this).next().removeClass('hidden');			
		});

		//点击暂停
		$('.player_control').find('.stop').click(function () {
			//正在播放的歌曲暂停
			musicPlayer.audio.pause();
			//去掉歌曲名称的高亮
			$('li.music').eq(musicPlayer.currentIndex).find('.music_name span').removeClass('active');
			$(this).addClass('hidden');
			$(this).prev().removeClass('hidden');			
		});

		//点击播放下一首
		$('.next').click(function(){						
			var nextLiIndex = musicPlayer.currentIndex + 1;
			var musicLiLength = $('li.music').length;
			if(nextLiIndex > musicLiLength-1){
				nextLiIndex = 0;
			}
			var playMusicLi = $('li.music').eq(nextLiIndex);			
			playMusicLi.find('.play').trigger('click');	
		});

		//点击播放上一首
		$('.prev').click(function(){
			var prevLiIndex = musicPlayer.currentIndex-1;
			var musicLiLength = $('li.music').length;
			if(prevLiIndex < 0){
				prevLiIndex = musicLiLength-1;
			}
			var playMusicLi = $('li.music').eq(prevLiIndex);
			playMusicLi.find('.play').trigger('click');	
		});
		
		//2.4删除按钮点击
		//点击music_delete删除选中那行音乐
		$('.mod_musiclist').delegate('li.music .music_delete', 'click', function(){
			//删除点击图标所对应的音乐li
			$(this).parents('li.music').remove();
			//获取删除的音乐li的序号
			var deleteIndex = $(this).parents('li.music').get(0).index;				
			//修改li的index属性
			$('li.music').each(function(index, ele){
				ele.index = index;
				$(this).find('.music_index').text(index+1);
			});			
			if(deleteIndex == musicPlayer.currentIndex){
				musicPlayer.currentIndex -=1; 
				$('.next').trigger('click');
			}else if(deleteIndex < musicPlayer.currentIndex){
				musicPlayer.currentIndex -=1;
			}		
		});
		
		//播放进度监听
		musicPlayer.musicPlayTime(playProgress, function(playTimeStr){
			$('.music_time_play').text(playTimeStr);
		});
		
		
		//2.5自动播放下一首
		var $next = $('.next');
		musicPlayer.autoPlayNext($next);
		
		//2.6切换播放模式 切换图标
		$('.play_mode').children().each(function () {
			$(this).click(function () {
				
				$(this).next().removeClass('hidden');
				$(this).next().siblings().addClass('hidden');
				if ($(this).index() == 2) {
					$(this).parent().children().first().removeClass('hidden');
					$(this).addClass('hidden');
				} 
			})	    
		});

		//2.7喜欢 取消喜欢 切换图标
		$('.music_like').children().eq(0).click(function () {
			$(this).addClass('hidden');
			$(this).siblings().removeClass('hidden');
		})

		$('.music_like').children().eq(1).click(function () {
			$(this).addClass('hidden');
			$(this).siblings().removeClass('hidden');
		});

		//2.8点击歌曲的复选框
		$('.mod_musiclist').delegate('.music_checkbox_border', 'click', function(){
			var nowState = $(this).attr('class').indexOf('checked');
			
			if(nowState != -1){
				$(this).removeClass('checked');
				$('.musiclist_checkbox_border').removeClass('checked');
			}else {
				$(this).addClass('checked');
			}
		});

		//2.9点击选中全部歌曲
		$('.musiclist_checkbox_border').click(function () {
			var nowState = $(this).attr('class').indexOf('checked');			
			if(nowState != -1){
				$(this).addClass('checked');
				$('.music_checkbox_border').addClass('checked')
			}else {
				$(this).removeClass('checked');
				$('.music_checkbox_border').removeClass('checked')
			}
			$(this).toggleClass('checked');
			$('.music_checkbox_border').toggleClass('checked');
		});		
	})();
})














