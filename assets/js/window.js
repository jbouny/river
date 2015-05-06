var WINDOW = {
	ms_Width: 0,
	ms_Height: 0,
	ms_DPR: 1,
	
	initialize: function initialize()
	{
		this.updateSize();
		
		$(window).resize(function(inEvent)
		{
			WINDOW.updateSize();
			WINDOW.resizeCallback(WINDOW.ms_Width, WINDOW.ms_Height, WINDOW.ms_DPR);
		});
	},
	updateSize: function updateSize() {
		this.ms_Width = $(window).width();
		this.ms_Height = $(window).height();
		this.ms_DPR =  (window.devicePixelRatio) ? window.devicePixelRatio : 1;
	},
	resizeCallback: function resizeCallback(inWidth, inHeight, DPR) {}
};