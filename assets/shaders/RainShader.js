THREE.RainShader =
{
	uniforms: {
		"color" : { type: "c", value: new THREE.Color( 0x363b4d ) },
	},

	vertexShader: [
	    "attribute float alpha;",
	    "attribute float size;",

	    "varying float vAlpha;",
	    "varying float vSize;",

	    "void main() {",
	        "vAlpha = alpha;",
	        "vSize = size;",
	        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	        "gl_PointSize = size;",

	        "gl_Position = projectionMatrix * mvPosition;",
	    "}"
    ].join("\n"),

    fragmentShader: [
		"uniform vec3 color;",
		"varying float vAlpha;",
		"varying float vSize;",

		"void main()",
		"{",
		    "vec4 sum = vec4( 0.0 );",
		    "float calColor = 0.0;",
		    "float currentX = ceil(gl_PointCoord.x * vSize);",
		    "float currentY = ceil(gl_PointCoord.y * vSize);",
		    "float calcY = abs(currentY - (vSize * .2)) / (vSize * .5);",
		    "if(currentX  == ceil(vSize * .5)) {",
	    		"calColor = 1.0;",
	    	"} else if( currentX == (ceil(vSize * .5)-1.0) || currentX == (ceil(vSize * .5)+1.0)) {",
	    		"calColor = 0.3;",
	    	"}",

			"gl_FragColor = vec4(color, calColor*vAlpha*calcY);",
		"}",
	].join("\n")
}