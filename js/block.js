(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  //TODO: clean up the logic for sprite switching.
  //TODO: There's a weird bug with the collision logic. Look into it.

  var Block = Mario.Block = function(options) {
    this.item = options.item;
    this.usedSprite = options.usedSprite;
    this.bounceSprite = options.bounceSprite;
    this.breakable = options.breakable;

    Mario.Entity.call(this, {
      pos: options.pos,
      sprite: options.sprite,
      //Hitbox en pixels
      hitbox: [1,0,14,16]
    });

    this.standing = true;
  };

  Mario.Util.inherits(Block, Mario.Floor);

//Casser un bloc
  Block.prototype.break = function() {
    //Jouer le son de cassage de bloc
    sounds.breakBlock.play();
    //Jouer l'animation de cassage de bloc
    new Mario.Rubble().spawn(this.pos);
    //Supprimer le bloc du niveau
    var x = this.pos[0] / 16, y = this.pos[1] / 16;
    delete level.blocks[y][x];
  };

  //Se cogner la tete contre un bloc
  Block.prototype.bonk = function(power) {
    //Jouer le son
    sounds.bump.play();
    //Si on est grand et que c'est un bloc cassable, casser le bloc
    if (power > 0 && this.breakable) {
      this.break();
      //Sinon jouer l'animation de "bouncing"
    } else if (this.standing){
      this.standing = false;
      //Si le bloc contient un item le faire apparaitre
      if (this.item) {
        this.item.spawn();
        this.item = null;
      }
      this.opos = [];

      //Remettre le bloc a sa position de départ
      this.opos[0] = this.pos[0];
      this.opos[1] = this.pos[1];

      if (this.bounceSprite) {
        this.osprite = this.sprite;
        this.sprite = this.bounceSprite;
      } else {
        this.sprite = this.usedSprite;
      }

      //Vélocité négative pour le bloc
      this.vel[1] = -2;
    }
  };

  Block.prototype.update = function(dt, gameTime) {
    if (!this.standing) {
      if (this.pos[1] < this.opos[1] - 8) {
        this.vel[1] = 2;
      }
      if (this.pos[1] > this.opos[1]) {
        this.vel[1] = 0;
        this.pos = this.opos;
        if (this.osprite) {
          this.sprite = this.osprite;
        }
        this.standing = true;
      }
    } else {
      if (this.sprite === this.usedSprite) {
        var x = this.pos[0] / 16, y = this.pos[1] / 16;
        level.statics[y][x] = new Mario.Floor(this.pos, this.usedSprite);
        delete level.blocks[y][x];
      }
    }

    this.pos[1] += this.vel[1];
    this.sprite.update(dt, gameTime);
  };

})();
