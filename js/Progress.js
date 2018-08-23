(function(window){
	function Progress($progressBack, $progressFore, $progressDot){
	this.$progressBack = $progressBack;
	this.$progressFore = $progressFore;
	this.$progressDot = $progressDot;
	
	this.backWidth = $progressBack.width();
	this.playWidth = $progressFore.width();
	this.isMove = false;
	this.dragScale = undefined;
    }

	Progress.prototype = {
		constructor: Progress,	
		progressClick: function(callback) {
			var progress = this;
			var $progressFore = this.$progressFore;
			var $progressDot = this.$progressDot;
			this.$progressBack.click(function(e) {	
				this.isMove = false;
				progress.playWidth = e.clientX - $(this).offset().left;			
				$progressFore.css('width', progress.playWidth);
				$progressDot.css('left', progress.playWidth);			
				callback(progress.playWidth / progress.backWidth);
			});		
		},
		
		progressDrag: function(callback, voiceCallback) {
			var progress = this;
			var $progressBack = this.$progressBack;
			var $progressFore = this.$progressFore;
			var $progressDot = this.$progressDot
			this.$progressDot.mousedown(function() {
								
				$(document).mousemove(function(e){	
					progress.isMove = true;
					progress.playWidth = e.clientX - $progressBack.offset().left ;	
					//屏蔽超出进度条的位置
					if(progress.playWidth >= progress.backWidth){
						progress.playWidth = progress.backWidth;
					}else if(progress.playWidth < 0) {
						progress.playWidth = 0;
					}
					$progressFore.css('width', progress.playWidth);
					$progressDot.css('left', progress.playWidth);				
					progress.dragScale = progress.playWidth / progress.backWidth;	
					if(voiceCallback) {
						voiceCallback(progress.dragScale);	
					}								
				});
				$(document).mouseup(function() {
					$(document).off('mousemove');
					$(document).off('mouseup');
					callback(progress.playWidth / progress.backWidth);					
					progress.isMove = false;					
				});	
				
			});	
		},
		
		progressDot: function(audio) {
			var $progressBack = this.$progressBack;
			var $progressFore = this.$progressFore;
			var $progressDot = this.$progressDot;				
			this.playWidth = audio.currentTime / audio.duration * this.backWidth;
			$progressFore.css('width', this.playWidth);
			$progressDot.css('left', this.playWidth);
		}	
	};
	window.Progress = Progress;
})(window);
