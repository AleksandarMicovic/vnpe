$(document).ready(function() {
    var SCALE,
        canvas,
        ctx,
        world,
        fixDef,
		mouseX,
		mouseY,
		isMouseDown,
        shapes = {},
		channel,
		socket = new io.Socket();

	var messaged = function(data) {
		switch (data.type) {
			case 'connection': {
				// We don't care about our own messages being broadcasted.
				if (socket.transport.sessionid != data.id) {
					console.log("New connection!");
				}
				break;
			}
			case 'new_object': {
                if (socket.transport.sessionid != data.id) {
					console.log("Object received.");
					add.random();
				}
				break;
			} 
		}
    }

    var connected = function() {
		channel = document.location.pathname.split('/')[2];
        socket.subscribe(channel);
    };

	socket.connect();
    socket.on('connect', connected);
    socket.on('message', messaged)

    // Init som useful stuff for easier access (don't need 'em all)
    var b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2AABB = Box2D.Collision.b2AABB
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
        , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var SCALE,
        canvas,
        ctx,
        world,
        fixDef,
		mouseX,
		mouseY,
		isMouseDown,
        shapes = {};
        
    var debug = false;

   	function handleMouseMove(e) {
		mouseX = (e.clientX - canvas.getBoundingClientRect().left) / SCALE;
		mouseY = (e.clientY - canvas.getBoundingClientRect().top) / SCALE;
	};

    var init = {
        start: function(canvasID) {
            this.defaultProperties();
            this.canvas(canvasID);
            
            box2d.create.world();
            box2d.create.defaultFixture();
            
            this.surroundings.leftWall();
            this.surroundings.ground();
            
            this.callbacks();
           
			// Add a few random pieces. 
            setTimeout(function() { add.random(); }, 0);
            setTimeout(function() { add.random(); }, 100);
            setTimeout(function() { add.random(); }, 500);
            setTimeout(function() { add.random(); }, 700);
            setTimeout(function() { add.random(); }, 1000);
         
   
            // On my signal: Unleash hell.
            (function hell() {
                loop.step();
                loop.update();
                if (debug) {
                    world.DrawDebugData();
                }
                loop.draw();
                requestAnimFrame(hell);
				loop.checkOffScreen(1,2,3,4);
            })();
        },
        defaultProperties: function() {
            SCALE = 30;
        },
        canvas: function(canvasID) {
            canvas = document.getElementById(canvasID);
            ctx = canvas.getContext("2d");
			canvas.oncontextmenu = function() {
				return false;
			}
        },
        surroundings: {
            ground: function() {
                add.box({
                    x: 15, // 740 / 30 / 2
                    y: 500 / 30,
                    height: 2,
                    width:900 / 30, // 740 / 30
                    isStatic: true
                });
            },
            leftWall: function() {
                add.box({
                    x: -0.009,
                    y: 0,
                    height: 32, // 380px / 30
                    width:2,
                    isStatic: true
                });
            }
        },
        callbacks: function() {
            canvas.addEventListener('contextmenu', function(e) {
                var shapeOptions = {
                    x: (canvas.width / SCALE) * (e.offsetX / canvas.width),
                    y: 0
                };
                add.random(shapeOptions);
            }, false);
            canvas.addEventListener("mousedown", function(e) {
                isMouseDown = true;
                handleMouseMove(e);
                canvas.addEventListener("mousemove", handleMouseMove, true);
            }, true);
            canvas.addEventListener("mouseup", function() {
                canvas.removeEventListener("mousemove", handleMouseMove, true);
                isMouseDown = false;
                mouseX = undefined;
                mouseY = undefined;
            }, true);
        }
    };
     
     
    var add = {
        random: function(options) {
            options = options || {};
            if (Math.random() < 0.5){
                this.circle(options);
            } else {
                this.box(options);
            }
        },
        circle: function(options) {
            options.radius = 0.5 + Math.random()*1;
            var shape = new Circle(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);
        },
        box: function(options) {
            options.width = options.width || 0.5 + Math.random()*2;
            options.height = options.height || 0.5 + Math.random()*2;
            var shape = new Box(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);
        }
    };

    var box2d = {
        addToWorld: function(shape) {
            var bodyDef = this.create.bodyDef(shape);
            var body = world.CreateBody(bodyDef);
            if (shape.radius) {
                fixDef.shape = new b2CircleShape(shape.radius);
            } else {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(shape.width / 2, shape.height / 2);
            }
            body.CreateFixture(fixDef);
        },
        create: {
            world: function() {
                world = new b2World(
                    new b2Vec2(0, 10) //gravity
                    , false //allow sleep
                );
                
                if (debug) {
                    var debugDraw = new b2DebugDraw();
                    debugDraw.SetSprite(ctx);
                    debugDraw.SetDrawScale(30.0);
                    debugDraw.SetFillAlpha(0.3);
                    debugDraw.SetLineThickness(1.0);
                    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                    world.SetDebugDraw(debugDraw);
                }
            },
            defaultFixture: function() {
                fixDef = new b2FixtureDef;
                fixDef.density = 1.0;
                fixDef.friction = 0.5;
                fixDef.restitution = 0.2;
            },
            bodyDef: function(shape) {
                var bodyDef = new b2BodyDef;
        
                if (shape.isStatic == true) {
                    bodyDef.type = b2Body.b2_staticBody;
                } else {
                    bodyDef.type = b2Body.b2_dynamicBody;
                }
                bodyDef.position.x = shape.x;
                bodyDef.position.y = shape.y;
                bodyDef.userData = shape.id;
                bodyDef.angle = shape.angle;
            
                return bodyDef;
            }
        },
        get: {
            bodySpec: function(b) {
                return {
                    x: b.GetPosition().x,
                    y: b.GetPosition().y,
                    angle: b.GetAngle(),
                    center: {
                        x: b.GetWorldCenter().x,
                        y: b.GetWorldCenter().y
                    }
                };
            }
        },
		getBodyAt: function(x, y) {
			var mousePVec = new b2Vec2(x, y);
			var aabb = new b2AABB();
			aabb.lowerBound.Set(x - 0.001, y - 0.001);
			aabb.upperBound.Set(x + 0.001, y + 0.001);
			
			// Query the world for overlapping shapes.
			var selectedBody = null;
			world.QueryAABB(function(fixture) {
				if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
					if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
						selectedBody = fixture.GetBody();
						return false;
					}
				}
				return true;
			}, aabb);
			
			return selectedBody;
		},
		mouseDownAt: function(x, y) {
			if (!this.mouseJoint) {
				var body = this.getBodyAt(x, y);
				if (body) {
					var md = new b2MouseJointDef();
					md.bodyA = world.GetGroundBody();
					md.bodyB = body;
					md.target.Set(x, y);
					md.collideConnected = true;
					md.maxForce = 300.0 * body.GetMass();
					this.mouseJoint = world.CreateJoint(md);
					body.SetAwake(true);
				}
			} else {
				this.mouseJoint.SetTarget(new b2Vec2(x, y));
			} 
		},
		isMouseDown: function() {
			return (this.mouseJoint != null);
		},
 		mouseUp: function() {
			world.DestroyJoint(this.mouseJoint);
			this.mouseJoint = null;
		} 
    };

    var loop = {
        step: function() {
            var stepRate = 1 / 60;
            world.Step(stepRate, 10, 10);
            world.ClearForces();
        },
        update: function () {
            for (var b = world.GetBodyList(); b; b = b.m_next) {
                if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
                    shapes[b.GetUserData()].update(box2d.get.bodySpec(b));
                }
            }
			if (isMouseDown) {
				box2d.mouseDownAt(mouseX, mouseY);
			} else if (box2d.isMouseDown()) {
				box2d.mouseUp();
			} 
        },
        draw: function() {
            if (!debug) ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (var i in shapes) {
                shapes[i].draw();
            }
        },
		checkOffScreen: function(x1, y1, x2, y2) {
			for (var b = world.GetBodyList(); b; b = b.m_next) {
				if (b.m_xf.position.x > 30) {
					var toSend = {
						object: "block",
						room: channel
					}
					console.log(toSend);
					socket.send(toSend);
					world.DestroyBody(b);
				}
			}
		}
    };
    
    var helpers = {
        randomColor: function() {
            var letters = '0123456789ABCDEF'.split(''),
                color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.round(Math.random() * 15)];
            }
            return color;
        }
    };
    
    /* Shapes down here */
    
    var Shape = function(v) {
        this.id = Math.round(Math.random() * 1000000);
        this.x = v.x || Math.random()*23 + 1;
        this.y = v.y || 0;
        this.angle = 0;
        this.color = helpers.randomColor();
        this.center = { x: null, y: null };
        this.isStatic = v.isStatic || false;
        
        this.update = function(options) {
            this.angle = options.angle;
            this.center = options.center;
            this.x = options.x;
            this.y = options.y;
        };
    };
    
    var Circle = function(options) {
        Shape.call(this, options);
        this.radius = options.radius || 1;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x * SCALE, this.y * SCALE, this.radius * SCALE, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
    };
    Circle.prototype = Shape;
    
    var Box = function(options) {
        Shape.call(this, options);
        this.width = options.width || Math.random()*2+0.5;
        this.height = options.height || Math.random()*2+0.5;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            ctx.fillStyle = this.color;
            ctx.fillRect(
                (this.x-(this.width / 2)) * SCALE,
                (this.y-(this.height / 2)) * SCALE,
                this.width * SCALE,
                this.height * SCALE
            );
            ctx.restore();
        };
    };
    Box.prototype = Shape;
    
    init.start('environment');
});
