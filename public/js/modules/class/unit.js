(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
        this.elBody = this.el.append('<div class="body"></div>').find('.body:first');
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
        return this.elBody.css({
          height: this.height,
          width: this.width,
          background: 'no-repeat url(' + this.imgpath + ')',
          left: this.width / 2 * -1,
          top: this.height / 2 * -1
        });
      };
      Unit.prototype.walkTo = function() {
        return MM.log('walking');
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
      Unit.prototype.chase = function(id) {
        return MM.log('chase');
      };
      Unit.prototype.stopChase = function() {
        return MM.log('stopchase');
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
