THREE.StarsShader =
{
	uniforms: {
		"color" : { type: "c", value: new THREE.Color( 0xffffff ) },
	},

	vertexShader: [
	    "attribute float alpha;",
	    "attribute float size;",

	    "varying float vAlpha;",

	    "void main() {",
	        "vAlpha = alpha;",
	        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	        "gl_PointSize = size;",
	        "gl_Position = projectionMatrix * mvPosition;",
	    "}"
    ].join("\n"),

    fragmentShader: [
		"uniform vec3 color;",
		"varying float vAlpha;",

		"void main() {",
		    "gl_FragColor = vec4( color, vAlpha );",
		"}"
	].join("\n")
}