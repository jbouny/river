var container, stats;
var hr = (new Date()).getHours();
var day = (hr >= 7 && hr <= 20);
var loaded = false;
var doneFading = false;

$(function()
{
	WINDOW.initialize();

	var parameters = {
		alea: RAND_MT,
		generator: PN_GENERATOR,
		width: 7000,
		height: 10000,
		widthSegments: 400,
		heightSegments: 200,
		depth:800,
		param: 1.8,
		filterparam: 1.2,
		filter: [ RIVER_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ]
	};

	container = $('<div></div>');
	$('body').append(container);

	var conditionNames = ['day', 'night', 'clear', 'rain'];
	var dayType = 0;

	if(!day || window.location.hash.indexOf('#night') === 0)
	{
		dayType = 1;
	}
	else if(window.location.hash.indexOf('#clear') === 0)
	{
		dayType = 2;
	}
	else if(window.location.hash.indexOf('#rain') === 0)
	{
		dayType = 3;
	}

	$('body').addClass(conditionNames[dayType]);

	$(BIGRIVER).bind('sceneLoadingUpdate', loadingUpdate )
	BIGRIVER.initialize('canvas-3d', parameters, dayType);
	
	WINDOW.resizeCallback = function(inWidth, inHeight, DPR)
	{
		BIGRIVER.resize(inWidth, inHeight, DPR);
	};
	BIGRIVER.resize(WINDOW.ms_Width, WINDOW.ms_Height, WINDOW.ms_DPR);
	
	mainLoop();

	$('#canvas-3d').delay(500).fadeIn(1000, function()
	{
		if(loaded) doOutroToSite();
		doneFading = true;
	});

	$('#scene-selector .handle').click(function()
	{
		$('#scene-selector').toggleClass('open');	

		return false;
	});

	window.onhashchange = function() {
	    window.location.reload();
	}

});

function mainLoop()
{
	requestAnimationFrame(mainLoop);
	BIGRIVER.update();
}


function loadingUpdate(e)
{
	console.log(e.amount);
	if(e.amount >= 1)
	{
		loaded = true;
		if(doneFading) doOutroToSite();
	}
}

function doOutroToSite()
{
	doingIntro = true;

	var delay = 2000;
	var duration = 3000;
	setTimeout('BIGRIVER.Loaded = true;', duration*.9);

	$('#loading-behind').remove();
	$('#loading').delay(delay).animate({'top' : $(window).height() }, {'duration' : duration, complete: function(){
			$('#loading').remove();
			$('#below').css('height','100px');
			$('#scene-selector .handle').addClass('show');
	}});
	$('#canvas-3d').delay(delay).animate({'top' : 0}, {'duration' : duration});
	
	setTimeout('BIGRIVER.addObjectsAfterLoad();', (delay*1.5)+(duration*.53));
}