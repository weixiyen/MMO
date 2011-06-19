(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  MM.add('class/unit', function(opts) {
    var NPC, PC, Unit;
    Unit = (function() {
      function Unit(data) {
        this.id = data.id;
        this.height = data.height;
        this.width = data.width;
        this.imgpath = data.imgpath;
        this.anim = data.anim;
        this.pos = data.pos;
        this.el = data.el;
        this.speed = data.speed;
        this.name = data.name;
        this.skip = data.skip;
        this.moving = false;
        this.tag = {
          pathloop: 'unit:' + this.id + ':path:loop',
          node1: 'unit:' + this.id + ':path:node:1',
          node2: 'unit:' + this.id + ':path:node:2',
          move: 'unit:' + this.id + ':move',
          anim: 'unit:' + this.id + ':anim',
          chase: 'unit:' + this.id + ':chase'
        };
        this.elBody = this.el.append('<div class="body"><div class="name"><span>' + this.name + '</span></div></div>').find('.body:first');
        this.elName = this.el.find('.name:first');
        this.create();
      }
      Unit.prototype.create = function() {
        this.el.css({
          left: this.pos[0],
          top: this.pos[1],
          zIndex: this.pos[1],
          height: 0,
          width: 0
        });
        this.elBody.css({
          height: this.height,
          width: this.width,
          background: 'no-repeat url(' + this.imgpath + ')',
          left: this.width / 2 * -1,
          top: this.height / 2 * -1
        });
        return this.elName.css({
          left: this.width / 2 - 50,
          top: -10
        });
      };
      Unit.prototype.stop = function() {
        $.loop.remove(this.tag.move);
        return MM.sprite.stop(this.tag.anim);
      };
      Unit.prototype.move = function(direction) {
        $.loop.add(this.tag.move, __bind(function() {
          return this.walk(direction);
        }, this));
        return MM.sprite.start(this.tag.anim, {
          el: this.elBody,
          queue: this.anim[direction],
          skip: this.skip
        });
      };
      Unit.prototype.walk = function(direction) {
        if (direction === 'w') {
          this.pos[0] -= this.speed;
        } else if (direction === 'e') {
          this.pos[0] += this.speed;
        } else if (direction === 'n') {
          this.pos[1] -= this.speed;
        } else if (direction === 's') {
          this.pos[1] += this.speed;
        }
        return this.el.css({
          left: this.pos[0],
          top: this.pos[1],
          zIndex: this.pos[1]
        });
      };
      Unit.prototype.walkTo = function(coords) {
        var LOOPID, NODE1, NODE2, divisor, path, walk, x1, x2, y1, y2;
        LOOPID = this.tag.pathloop;
        NODE1 = this.tag.node1;
        NODE2 = this.tag.node2;
        $.loop.remove(LOOPID);
        this.stop();
        divisor = MM.map.tileSize;
        x1 = Math.floor(this.pos[0] / divisor);
        y1 = Math.floor(this.pos[1] / divisor);
        x2 = Math.floor(coords[0] / divisor);
        y2 = Math.floor(coords[1] / divisor);
        path = MM.map.getPath([x1, y1], [x2, y2]);
        if (path.length < 2) {
          return;
        }
        walk = __bind(function() {
          if (path.length < 2) {
            $.loop.remove(LOOPID);
            this.stop();
            return;
          }
          MM.global[NODE1] = path.shift();
          MM.global[NODE2] = path[0];
          return this.move(MM.map.getDirection(MM.global[NODE1], MM.global[NODE2]));
        }, this);
        walk();
        return $.loop.add(LOOPID, __bind(function() {
          if (MM.map.completedPath(MM.global[NODE1], MM.global[NODE2], [this.pos[0], this.pos[1]])) {
            this.stop();
            return walk();
          }
        }, this));
      };
      Unit.prototype.doAbility = function() {
        return MM.log('do ability');
      };
      Unit.prototype.teleport = function() {
        return MM.log('teleport');
      };
      Unit.prototype.show = function() {
        return MM.log('show');
      };
      Unit.prototype.remove = function() {
        return MM.log('remove');
      };
      Unit.prototype.target = function(id) {
        return MM.log('target');
      };
      Unit.prototype.chase = function(obj) {
        if (!(obj instanceof Unit)) {
          obj = MM.map;
        }
        return $.loop.add(this.tag.chase, 35, __bind(function() {
          return this.walkTo(obj.pos);
        }, this));
      };
      Unit.prototype.stopChase = function() {
        $.loop.stop(this.tag.chase);
        return this.stop();
      };
      return Unit;
    })();
    PC = (function() {
      __extends(PC, Unit);
      function PC() {
        PC.__super__.constructor.apply(this, arguments);
      }
      PC.prototype.eat = function() {
        return MM.log('fooofofo');
      };
      return PC;
    })();
    NPC = (function() {
      __extends(NPC, Unit);
      function NPC() {
        NPC.__super__.constructor.apply(this, arguments);
      }
      NPC.prototype.eat = function() {
        return MM.log('eat');
      };
      return NPC;
    })();
    if (opts.type === 'pc') {
      return PC;
    }
    if (opts.type === 'npc') {
      return NPC;
    }
    return Unit;
  });
}).call(this);
