var BIGRIVER = {
	Canvas: null,
	Renderer: null,
	Camera: null, 
	Scene: null, 
	Controls: null,
	Water: null,
	Projector: null,
	Birds:[],
	TotalLoad: 0,
	CurrentLoad: 0,
	DirectionalLight: null,
	Loaded:false,

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),
	
	initialize: function initialize(inIdCanvas, inParameters, type)
	{
		this.Canvas = $('#'+inIdCanvas);
		
		// Initialize Renderer, Camera, Projector and Scene
		this.Renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.Canvas.html(this.Renderer.domElement);
		this.Scene = new THREE.Scene();
		
		this.Camera = new THREE.PerspectiveCamera(55.0, WINDOW.Width / WINDOW.Height, 15, 30000);
		this.Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 80, -inParameters.height);
		this.Camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.Projector = new THREE.Projector();
		
		// Initialize Orbit control		
		this.Controls = new THREE.OrbitControls(this.Camera, this.Renderer.domElement);
		this.Controls.userPan = false;
		this.Controls.userPanSpeed = 0.0;
		this.Controls.maxDistance = 5000.0;
		this.Controls.maxPolarAngle = Math.PI * 0.8;
	
		// Add light
		this.DirectionalLight = new THREE.DirectionalLight(0xffff55, .4);
		this.DirectionalLight.position.set(0, 3000, -5000);
		this.Scene.add(this.DirectionalLight);

		this.textureFlare0 = THREE.ImageUtils.loadTexture( "assets/img/lensflare0.jpg", {}, $.proxy(this.loadCallback, this) );
		this.textureFlare2 = THREE.ImageUtils.loadTexture( "assets/img/lensflare2.jpg", {}, $.proxy(this.loadCallback, this) );
		this.textureFlare3 = THREE.ImageUtils.loadTexture( "assets/img/lensflare3.jpg", {}, $.proxy(this.loadCallback, this) );
		this.textureFlare4 = THREE.ImageUtils.loadTexture( "assets/img/lensflare4.jpg", {}, $.proxy(this.loadCallback, this) );
		this.textureFlare5 = THREE.ImageUtils.loadTexture( "assets/img/lensflare5.jpg", {}, $.proxy(this.loadCallback, this) );

		this.addLight( 0.995, 0.025, 0.99, -2500, 3000, 4000 );
		
		// Create terrain
		this.loadTerrain(inParameters);

		this.CurrentLoad += 5;
		
		this.makeRocks(inParameters);
		this.makeMountains(inParameters);

		this.changeEnvironment(type, inParameters);
		
		this.updateCamera(.3);		
	},

	changeEnvironment: function(type, inParameters)
	{
		this.loadSkyBox(type);

		switch(type)
		{
			case 0:
				this.DirectionalLight.color.setHex( 0xffff55 );
				this.loadTreeSprites(inParameters);
				this.loadGrassSprites(inParameters);
				this.Scene.fog = new THREE.Fog(0x996943, inParameters.height*.1, inParameters.height);
				this.addWater(0x775129, inParameters);
				this.playBirds();
				this.addParticles();

				break;
			case 1:
				this.DirectionalLight.color.setHex( 0x72c3fb );
				this.DirectionalLight.intensity = .35;
				this.loadTreeSprites(inParameters);
				this.loadGrassSprites(inParameters);
				this.Scene.fog = new THREE.Fog(0x272d6b, inParameters.height*.1, inParameters.height);
				this.addWater(0x361d8a, inParameters);     

				this.Scene.remove(this.lensFlare);
				this.addMoon(inParameters);
				this.addStars(inParameters);
				this.addFireflies(inParameters);
				break;
			case 2:
				this.DirectionalLight.color.setHex( 0xddcd8c );
				this.DirectionalLight.intensity = .5;
				this.loadTreeSprites(inParameters);
				this.loadGrassSprites(inParameters);
				this.Scene.fog = new THREE.Fog(0x433534, inParameters.height*.1, inParameters.height);
				this.addWater(0x004783, inParameters);
				this.playBirds();
				this.addParticles();
				this.addSun();
				this.Scene.remove(this.lensFlare);

				break;
			case 3:
				this.DirectionalLight.color.setHex( 0xbabdb5 );
				this.DirectionalLight.intensity = .5;
				this.loadTreeSprites(inParameters);
				this.loadGrassSprites(inParameters);
				this.Scene.fog = new THREE.Fog(0xbabdb5, inParameters.height*.1, inParameters.height);
				this.addWater(0x9ba5ab, inParameters);
				this.Scene.remove(this.lensFlare);
				this.addRain(inParameters);

				break;
		}
	},

	addSun: function(inParameters)
	{
		var sunTex = THREE.ImageUtils.loadTexture( "assets/img/sun.png", {}, $.proxy(this.loadCallback, this) );
		this.CurrentLoad++;

		var sunMat = new THREE.MeshBasicMaterial( { map: sunTex, side: THREE.DoubleSide, transparent : true, depthWrite:true  } );
		sunMat.opacity = .3;

		var geometry = new THREE.PlaneBufferGeometry(5000, 5000, 4, 4);
		this.sun = new THREE.Mesh( geometry, sunMat );
		this.sun.position.set(0, 2, -3000);
		this.sun.rotation.y =  Math.PI;
		this.sun.rotation.x =  Math.PI*.5;
		this.Scene.add(this.sun);
	},

	addMoon: function(inParameters)
	{
		var moonTex = THREE.ImageUtils.loadTexture( "assets/img/moon.png", {}, $.proxy(this.loadCallback, this) );
		this.CurrentLoad++;

		var moonMat = new THREE.MeshBasicMaterial( { map: moonTex, side: THREE.FrontSide, transparent : true, depthWrite:false } );
		moonMat.fog = false;

		var geometry = new THREE.PlaneBufferGeometry(4000, 4000, 4, 4);
		this.moon = new THREE.Mesh( geometry, moonMat );
		this.moon.position.set(0, 1300, -2000);
		this.moon.rotation.y =  Math.PI;
		this.Scene.add(this.moon);
	},

	addStars: function(inParameters)
	{
		this.attributes =
		{
	        alpha: { type: 'f', value: [] },
	        size: { type: 'f', value: [] }
	    };

	    var starsShader = THREE.StarsShader;


		this.starsGeometry = new THREE.Geometry();
		var spreadX = inParameters.width * 4;
		var spreadY = inParameters.height * .5;

		for ( i = 0; i < 800; i ++ )
		{
			var vertex = new THREE.Vector3();
			vertex.x = Math.random() *  spreadX - (spreadX * .5);
			vertex.y = Math.random() * spreadY - (spreadY * .5)
			vertex.z = Math.random() * 10000;

			this.starsGeometry.vertices.push( vertex );

		}

		var shaderMaterial = new THREE.ShaderMaterial( {

	        uniforms:       starsShader.uniforms,
	        attributes:     this.attributes,
	        vertexShader:   starsShader.vertexShader,
	        fragmentShader: starsShader.fragmentShader,
	        transparent:    true
	    });

		this.stars = new THREE.PointCloud( this.starsGeometry, shaderMaterial );
		this.stars.sortParticles = false;
		this.stars.position.y = 3200;
		this.stars.position.z = 4100;
		this.Scene.add( this.stars );

		for( i = 0; i < this.stars.geometry.vertices.length; i++ )
		{
        	this.attributes.alpha.value[ i ] = Math.random();
        	this.attributes.size.value[i] = Math.max(1, Math.random()+Math.random()+Math.random());
    	}

	},

	addRain: function(inParameters)
	{
		this.rain = [];

		for(var i = 0; i < 4; i++)
		{
			var attributes =
			{
		        alpha: { type: 'f', value: [] },
		        size: { type: 'f', value: [] }
		    };

		    var rainShader = THREE.RainShader;
			var rainGeometry = new THREE.Geometry();
			var spreadX = inParameters.width * 4;
			var spreadY = inParameters.height;

			for ( var v = 0; v < 5000; v++ )
			{
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() *  spreadX - (spreadX * .5);
				vertex.y = Math.random() * spreadY - (spreadY * .5)
				//vertex.z = Math.random() * 10000;

				rainGeometry.vertices.push( vertex );
			}

			var shaderMaterial = new THREE.ShaderMaterial( {

		        uniforms:       rainShader.uniforms,
		        attributes:     attributes,
		        vertexShader:   rainShader.vertexShader,
		        fragmentShader: rainShader.fragmentShader,
		        transparent:    true,
		        blending: THREE.AdditiveBlending,
		        depthTest: false,
		        depthWrite: false
		    });

			var rain = new THREE.PointCloud( rainGeometry, shaderMaterial );;
			this.Scene.add( rain );

			for(var a = 0; a < rain.geometry.vertices.length; a++ )
			{
	        	attributes.alpha.value[a] = Math.min(.7, Math.random()+.1);
	        	attributes.size.value[a] = Math.random()*35+10;
	    	}

	    	rain.position.y = (spreadY * .6) * (i %2);

	    	rain.position.z = -3000;

	    	var rainSpeed =15+((i %2) * 10);
	    	this.rain.push({'geo':rainGeometry, 'rain' : rain, 'attributes':attributes, 'speed' : rainSpeed, 'height' : spreadY});
	    }
	},

	addWater: function(color, inParameters)
	{
		var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg',{}, $.proxy(this.loadCallback, this));
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

		this.Water = new THREE.Water(this.Renderer, this.Camera, this.Scene, {
			textureWidth: 512, 
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	.9,
			sunDirection: this.DirectionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: color,
			distortionScale: 16.0,
			fog: true
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 5, 5), 
			this.Water.material
		);
		aMeshMirror.add(this.Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.Scene.add(aMeshMirror);

		this.CurrentLoad += 1;
	},

	addFireflies: function(inParameters)
	{
		this.fireflies = [];
		var parameters = [
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 20 ],
					[ [0, 0, 0], 20 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 20 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 20 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 12 ],
					[ [0, 0, 0], 20 ],
					[ [0, 0, 0], 12 ],
				];

		var materials = [];
		var geometry = new THREE.Geometry();

		for ( i = 0; i < 12; i ++ )
		{

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 200 - 100;
			vertex.y = Math.random() * 100 - 50;
			vertex.z = Math.random() * 6000;

			geometry.vertices.push( vertex );

		}
		var map = THREE.ImageUtils.loadTexture('assets/img/firefly.png', {}, $.proxy(this.loadCallback, this));

		this.CurrentLoad++;

		for ( i = 0; i < parameters.length; i ++ ) {

			size  = parameters[i][1];

			var material = new THREE.PointCloudMaterial( { size: size, map: map } );
			material.transparent = true;
			//material.blending = THREE.AdditiveBlending;
			//material.depthTest = false;

			particles = new THREE.PointCloud( geometry, material );
			particles.position.x = i % 2 == 0 ? -1000 : 1000;
			particles.position.y = 50;
			particles.position.z = this.Camera.position.z + 100;
			this.Scene.add( particles );
			this.fireflies.push(particles);
		}
	},

	addParticles: function()
	{
		this.particles = [];
		var parameters = [
					[ [0, 0, 0], 10 ],
					[ [0, 0, 0], 4 ],
				];

		var materials = [];
		var geometry = new THREE.Geometry();

		for ( i = 0; i < 400; i ++ )
		{

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2000 - 1000;
			vertex.y = Math.random() * 2000 - 1000;
			vertex.z = Math.random() * 2000 - 1000;

			geometry.vertices.push( vertex );

		}
		var map = THREE.ImageUtils.loadTexture('assets/img/dust.jpg', {}, $.proxy(this.loadCallback, this));

		this.CurrentLoad++;

		for ( i = 0; i < parameters.length; i ++ ) {

			size  = parameters[i][1];

			var material = new THREE.PointCloudMaterial( { size: size, map: map } );
			material.transparent = true;
			material.blending = THREE.AdditiveBlending;
			material.opacity = .3;
			material.depthTest = false;

			particles = new THREE.PointCloud( geometry, material );
			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;
			particles.position.z = this.Camera.position.z + 100;
			this.Scene.add( particles );
			this.particles.push(particles);
		}
	},

	makeRocks: function(inParameters)
	{
		var rockTex = THREE.ImageUtils.loadTexture( "assets/img/rock-mat.jpg" , {}, $.proxy(this.loadCallback, this));
		this.CurrentLoad++;

		var rockMat = new THREE.MeshPhongMaterial( { map: rockTex, side: THREE.DoubleSide, fog: true} );
		var segments = 10;
		var rings = 10;
		var totalRocks = 12;

		for(var i = 0; i < totalRocks; i++)
		{
			var cluster = Math.ceil(Math.random()*4);
			var zSpot = (-inParameters.width)+(inParameters.width * (i / totalRocks))+(Math.random()*200);
			var xSpot = ((inParameters.width*.6) * Math.random()) - (inParameters.width*.3);

			for(var cl = 0; cl < cluster; cl++)
			{
				var radius = 20+(Math.random()*50);
				var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings);
				
				var density = radius / (segments+rings);
				var param = 2;
				
				for( var v = 0; v < sphereGeometry.vertices.length; v++ )
				{
					var change = Math.random() * param;
					var vertex = sphereGeometry.vertices[v];
					vertex.x += change * density;
					vertex.y += change * density;
					vertex.z += change * density;
				}

				var sphere = new THREE.Mesh(sphereGeometry, rockMat);
				sphere.position.x = xSpot+(cl*(radius*4)-(2*Math.random()));
				sphere.position.y = radius*-.2;
				sphere.position.z = zSpot+(cl*(radius*2));
				sphere.scale.x += Math.random();
				sphere.scale.z += Math.random();
				sphere.doubleSided = true;
				this.Scene.add(sphere);
			}
		}
	},

	makeMountains: function(inParameters)
	{
		var mountainsTex = THREE.ImageUtils.loadTexture( "assets/img/mountains.png", {}, $.proxy(this.loadCallback, this) );
		this.CurrentLoad++;

		var mountainsMat1 = new THREE.MeshBasicMaterial( { map: mountainsTex, side: THREE.FrontSide, transparent : true, opacity:.65, depthWrite:false } );

		var geometry = new THREE.PlaneBufferGeometry(inParameters.width,inParameters.width, 4, 4);
		var planeMesh= new THREE.Mesh( geometry, mountainsMat1 );
		planeMesh.position.set(0, -2300, 3000);
		planeMesh.rotation.y =  Math.PI;
		this.Scene.add(planeMesh);

		var mountainsMat2 = new THREE.MeshBasicMaterial( { map: mountainsTex, side: THREE.BackSide, transparent : true, opacity:.3, depthWrite:false } );

		var geometry = new THREE.PlaneBufferGeometry(inParameters.width,inParameters.width, 4, 4);
		var planeMesh= new THREE.Mesh( geometry, mountainsMat2 );
		planeMesh.position.set(1500, -2100, 3500);
		this.Scene.add(planeMesh);
	},

	addObjectsAfterLoad: function()
	{
	},
	
	loadSkyBox:  function(type)
	{
		if(this.aSkybox) this.Scene.remove(this.aSkybox);

		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  'assets/img/'+type+'004.jpg',
		  'assets/img/'+type+'002.jpg',
		  'assets/img/'+type+'006.jpg',
		  'assets/img/'+type+'005.jpg',
		  'assets/img/'+type+'001.jpg',
		  'assets/img/'+type+'003.jpg'
		], {}, $.proxy(this.loadCallback, this));

		aCubeMap.format = THREE.RGBFormat;

		this.CurrentLoad += 6;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		this.aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(20000, 20000, 20000),
		  aSkyBoxMaterial
		);
		
		this.aSkybox.rotation.y = Math.PI;

		this.Scene.add(this.aSkybox);
	},
	
	loadTerrain: function(inParameters) {
		var terrainGeo = TERRAINGEN.Get(inParameters);

		var terrainMaterial = new THREE.MeshPhongMaterial({vertexColors: THREE.VertexColors, shading: THREE.SmoothShading, side: THREE.DoubleSide });

		var terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
		terrain.position.y = - inParameters.depth * 0.2;
		this.Scene.add(terrain);
	},

	loadTreeSprites: function(inParameters)
	{
		var totalCols = 5;
		var totalRows = 16;
		
		var spriteTextures = [	THREE.ImageUtils.loadTexture( "assets/img/pinetree1.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/pinetree2.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/pinetree3.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/pinetree4.png", {}, $.proxy(this.loadCallback, this) )];
		this.CurrentLoad += 4;

		for (var c = 0; c < totalCols; c++)
		{
	        for (var r = 0; r < totalRows; r++)
	        {
	         	var randomMap = spriteTextures[Math.min(Math.floor(Math.random()*spriteTextures.length), spriteTextures.length-1)];
				var randScale = (Math.random() * 80);
				var spriteMaterial = new THREE.MeshBasicMaterial( { map: randomMap, side: THREE.FrontSide, transparent : true } );

				var geometry = new THREE.PlaneBufferGeometry(512-randScale, 512-randScale, 1, 1);
				treeSprite = new THREE.Mesh( geometry, spriteMaterial );
				treeSprite.position.z = (inParameters.width*-.5)+(inParameters.width * (r / totalRows))+(Math.random()*200);
				treeSprite.position.x = (inParameters.width*-.65)+(c*700)+(Math.random()*200);
				treeSprite.position.y = (512-randScale)-((c/totalCols) * 200);
				treeSprite.rotation.y = Math.PI;
				this.Scene.add( treeSprite );
	        }
    	}

    	for (var c = 0; c < totalCols; c++)
		{
	        for (var r = 0; r < totalRows; r++)
	        {
				// var randomMap = spriteTextures[Math.min(Math.floor(Math.random()*spriteTextures.length), spriteTextures.length-1)];
				// var spriteMaterial = new THREE.SpriteMaterial( { map: randomMap } );
				// spriteMaterial.fog = true;
				// //spriteMaterial.transparent = true;
				
				// var randScale = (Math.random() * 80);

				// var treeSprite = new THREE.Sprite( spriteMaterial );
				// treeSprite.scale.set( 512-randScale, 512-randScale, 1.0 );
				// treeSprite.position.z = (inParameters.width*-.5)+(inParameters.width * (r / totalRows))+(Math.random()*200);
				// treeSprite.position.x = (inParameters.width*.65)-(c*700)-(Math.random()*200);
				// treeSprite.position.y = (512-randScale)-((c/totalCols) * 200);
				// this.Scene.add( treeSprite );

				var randomMap = spriteTextures[Math.min(Math.floor(Math.random()*spriteTextures.length), spriteTextures.length-1)];
				var randScale = (Math.random() * 80);
				var spriteMaterial = new THREE.MeshBasicMaterial( { map: randomMap, side: THREE.FrontSide, transparent : true } );

				var geometry = new THREE.PlaneBufferGeometry(512-randScale, 512-randScale, 1, 1);
				treeSprite = new THREE.Mesh( geometry, spriteMaterial );
				treeSprite.position.z = (inParameters.width*-.5)+(inParameters.width * (r / totalRows))+(Math.random()*200);
				treeSprite.position.x = (inParameters.width*.65)-(c*700)-(Math.random()*200);
				treeSprite.position.y = (512-randScale)-((c/totalCols) * 200);
				treeSprite.rotation.y = Math.PI;
				this.Scene.add( treeSprite );
	        
	        }
    	}
	},


	loadGrassSprites: function(inParameters)
	{
		var totalCols = 3;
		var totalRows = 40;
		
		var spriteTextures = [	THREE.ImageUtils.loadTexture( "assets/img/grass1.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/grass2.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/grass3.png", {}, $.proxy(this.loadCallback, this) ),
								THREE.ImageUtils.loadTexture( "assets/img/grass4.png", {}, $.proxy(this.loadCallback, this) )];

		this.CurrentLoad += 4;

		for (var c = 0; c < totalCols; c++)
		{
	        for (var r = 0; r < totalRows; r++)
	        {
				var spriteMaterial = new THREE.SpriteMaterial( { map: spriteTextures[Math.min(Math.floor(Math.random()*spriteTextures.length), spriteTextures.length-1)], useScreenCoordinates: true  } );
				//spriteMaterial.depthWrite = false;
				spriteMaterial.fog = true;
				var grassSprite = new THREE.Sprite( spriteMaterial );
				grassSprite.scale.set( 68, 68, 1.0 );
				grassSprite.position.z = (inParameters.width*-.8)+(inParameters.width * (r / totalRows))
				grassSprite.position.x = (inParameters.width*-.15)+(c*200)+(Math.random()*-200);
				grassSprite.position.y = 10+((1-(c/totalCols)) * (20*totalCols));
				this.Scene.add( grassSprite );
	        }
    	}

    	for (var c = 0; c < totalCols; c++)
		{
	        for (var r = 0; r < totalRows; r++)
	        {
				var spriteMaterial = new THREE.SpriteMaterial( { map: spriteTextures[Math.min(Math.floor(Math.random()*spriteTextures.length), spriteTextures.length-1)], useScreenCoordinates: true  } );
				//spriteMaterial.depthWrite = false;
				spriteMaterial.fog = true;

				var grassSprite = new THREE.Sprite( spriteMaterial );
				grassSprite.scale.set( 68, 68, 1.0 );
				grassSprite.position.z = (inParameters.width*-.8)+(inParameters.width * (r / totalRows))
				grassSprite.position.x = (inParameters.width*.2)-(c*200)-(Math.random()*200);
				grassSprite.position.y = 10+((1-(c/totalCols)) * (15*totalCols));
				this.Scene.add( grassSprite );
	        }
    	}

	},

	addLight: function( h, s, v, x, y, z)
	{
		var light = new THREE.PointLight( 0xfde8bb, 1.5, 4500 );

		light.position.set( x, y, z );
		//this.Scene.add( light );

		light.color.setHSL( h, s, v );

		var flareColor = new THREE.Color( 0xfde8bb);
		flareColor.copy( light.color );

		this.lensFlare = new THREE.LensFlare( this.textureFlare0, 512, 0, THREE.AdditiveBlending, flareColor );

		this.lensFlare.add( this.textureFlare4, 512, 0.01, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare2, 512, 0.0, THREE.AdditiveBlending, flareColor );

		this.lensFlare.add( this.textureFlare3, 30, -0.15, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare5, 100, -0.2, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare5, 20, 0.12, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare3, 100, 0.15, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare3, 30, 0.35, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare5, 60, 0.4, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare3, 70, 0.5, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare5, 130, 0.78, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare5, 70, 0.72, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare3, 70, .85, THREE.AdditiveBlending, flareColor );
		this.lensFlare.add( this.textureFlare3, 30, .9, THREE.AdditiveBlending, flareColor );

		this.lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
		this.lensFlare.position = light.position;

		this.Scene.add( this.lensFlare );
		this.Controls.update();
	},

	lensFlareUpdateCallback: function( object )
	{

		var f, fl = object.lensFlares.length;
		var flare;
		var vecX = -object.positionScreen.x * 2;
		var vecY = -object.positionScreen.y * 2;


		for( f = 0; f < fl; f++ )
		{
		   flare = object.lensFlares[ f ];

		   flare.x = object.positionScreen.x + vecX * flare.distance;
		   flare.y = object.positionScreen.y + vecY * flare.distance;

		   flare.rotation = 0;
		}

		object.lensFlares[ 2 ].y += 0.025;
		object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + 45 * Math.PI / 180;
	},

	playBirds: function()
	{
		var self = this;
		var loader = new THREE.ColladaLoader();
		
		this.CurrentLoad++;

		loader.load('assets/models/bird.dae',function (collada)
		{
			self.loadCallback(null);
			self.removeBirds();

			var bird = collada.scene.children[0];
			var totalRows = Math.max(4, 8*Math.random());

	        for (var r = 0; r < totalRows; r++)
	        {
	        	var birdClone = collada.scene.children[0].clone();
	            var randScale = Math.max(1, .5+Math.random());

	            birdClone.children[0].geometry.vertices[0].y += Math.random()*10;
	        	birdClone.children[0].geometry.vertices[3].y += Math.random()*10;
	        	birdClone.children[0].material.opacity = .1;
	        	birdClone.velocity = Math.random();

				birdClone.scale.set(randScale, randScale, randScale);
				birdClone.rotation.y = Math.PI*.6;
				birdClone.position.y = 200+(Math.random() * (100 * r));
				birdClone.position.x = 1000+(Math.random() * (100 * r));
				birdClone.position.z = self.Camera.position.z + 2000;

	         	self.Scene.add(birdClone);  
	         	self.Birds.push(birdClone)
	        }
		});
	},

	removeBirds: function()
	{
		for(var i = 0; i < this.Birds.length; i++)
		{
			this.Scene.remove(this.Birds[i]);
		}

		this.Birds = [];
	},
	
	display: function()
	{

		if(this.rain) for(var r = 0; r < this.rain.length; r++) this.rain[r].rain.visible = false;

		this.Water.render();
		
		if(this.rain) for(var r = 0; r < this.rain.length; r++) this.rain[r].rain.visible = true;
		

		this.Renderer.render(this.Scene, this.Camera);
	},
	
	update: function()
	{
		var cameraDelta = .3;
		
		for(var i = 0; i < this.lensFlare.lensFlares.length; i++)
		{	
			var oscFlare = 3 * Math.sin((this.Camera.position.z*.1) * Math.PI / (10+(i*4)));
			this.lensFlare.lensFlares[i].opacity = (7+oscFlare)*.1;
		}

		if(this.particles)
		{
			var time = Date.now() * 0.0000001;
			var totalParticles = this.particles.length;
			for ( i = 0; i < totalParticles; i ++ )
			{

				var object = this.particles[i];
				object.position.z += cameraDelta;
				object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

			}
		}

		if(this.fireflies)
		{
			var time = Date.now() * 0.0000001;
			var totalParticles = this.fireflies.length;
			for ( i = 0; i < totalParticles; i ++ )
			{

				var object = this.fireflies[i];
				object.rotation.z += (i % 3 == 0 ? (i*.0008) : -(i*.0008));
				if(Math.random() > .99)  object.visible = !object.visible; 
			}
		}

		if(this.starsGeometry)
		{
			for( var i = 0; i < this.attributes.alpha.value.length; i++ )
			{
				var starsOsc = Math.sin((this.Camera.position.z*.7) * Math.PI / (Math.max(1, (i % 40)) * 10));

		        this.attributes.alpha.value[ i ] = starsOsc;
		    }

		    this.attributes.alpha.needsUpdate = true;
		}

		if(this.rain)
		{
			for(var r = 0; r < this.rain.length; r++)
			{
				this.rain[r].rain.position.y -= this.rain[r].speed;
				this.rain[r].rain.position.z += cameraDelta;

				if(this.rain[r].rain.position.y < this.rain[r].height*-.6) this.rain[r].rain.position.y = this.rain[r].height*.6;
			}
		}

		if(!this.Loaded)
		{
			this.Water.material.uniforms.time.value += 1 / 60.0;
			this.display();
			return;
		}

		this.updateCamera(cameraDelta);

		var totalBirds = this.Birds.length;
		
		for(var i = 0; i < totalBirds; i++)
		{
			var oscY = Math.max(6*this.Birds[i].velocity, 4) * Math.sin((this.Camera.position.z*.5) * Math.PI / Math.max(4*(1-this.Birds[i].velocity), 2));

			this.Birds[i].children[0].geometry.vertices[0].y = oscY;
	        this.Birds[i].children[0].geometry.vertices[3].y = oscY;

	        this.Birds[i].children[0].geometry.verticesNeedUpdate = true;

	        this.Birds[i].position.x -= Math.max(1, this.Birds[i].velocity * 3);
	        this.Birds[i].position.y += Math.max(.1, this.Birds[i].velocity * 1);
	        this.Birds[i].position.z += Math.max(.1, this.Birds[i].velocity * 1);
	        this.Birds[i].rotation.y += Math.PI*(this.Birds[i].velocity*.001);

	        this.Birds[i].rotation.y = Math.min(this.Birds[i].rotation.y, .5);
		}

		if(totalBirds > 0)
		{
			if(this.Birds[0].position.x < -2000) this.removeBirds()
		}

		this.display();
	},

	updateCamera: function(cameraDelta)
	{
		var oscX = 200 * Math.sin((this.Camera.position.z*.25) * Math.PI / 100);

		
		this.Camera.position.z += cameraDelta;

		if(this.lensFlare) this.lensFlare.z += cameraDelta;
		if(this.moon)
		{
				this.moon.position.z += cameraDelta;
				this.moon.position.x = oscX-1000;
		}
		if(this.sun)
		{
				this.sun.position.z += cameraDelta;
				this.sun.position.x = oscX;
		}
		if(this.stars)
		{
			this.stars.position.z += cameraDelta;
			this.stars.position.x = oscX;
		}
		
		this.Camera.position.x = oscX;
		this.Water.material.uniforms.time.value += 1 / 60.0;
	},

	loadCallback: function(e)
	{
		if(this.TotalLoad == 0) this.TotalLoad = this.CurrentLoad;

		this.CurrentLoad -= (e && e.image.length > 0) ? e.image.length : 1;

		$(this).trigger({
			type: "sceneLoadingUpdate",
			amount: 1-(this.CurrentLoad / this.TotalLoad)
		});

		if(this.TotalLoad <= 0) this.Loaded = true;
	},
	
	resize: function resize(inWidth, inHeight, DPR)
	{
		this.Camera.aspect =  inWidth / inHeight;
		this.Camera.updateProjectionMatrix();

		this.Renderer.setSize(inWidth, inHeight);      

		this.Canvas.html(this.Renderer.domElement);
		this.display();
	}
};