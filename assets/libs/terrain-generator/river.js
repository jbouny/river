var RIVER_FILTER =
{
	Apply: function( inCanvas, inParameters )
	{
		
		var context = inCanvas.getContext( "2d" );
		
		// Apply a linear gradient
		var gradient = context.createLinearGradient(0, 0, inCanvas.width, 0)
		gradient.addColorStop( 0.0, 'transparent' );
		gradient.addColorStop( 0.2, 'transparent' );
		gradient.addColorStop( 0.495, '#000000' );
		gradient.addColorStop( 0.515, '#000000' );
		gradient.addColorStop( 0.8, 'transparent' );
		gradient.addColorStop( 1.0, 'transparent' );
		context.fillStyle = gradient;
		
		context.rect( 0, 0, inCanvas.width, inCanvas.height );
		context.fill();
		
		BLUR_FILTER.Apply( inCanvas, inParameters );
	}
};