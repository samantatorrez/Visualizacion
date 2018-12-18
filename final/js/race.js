$( document ).ready(function() {
    const CONTAINER= "container";
    const CANT_PIXELS_MOV_SIDE = 5;
    const CANT_PIXELS_MOV_TOP = 3;
    const CANT_ENEMIES = 3;
    const BORDER_LEFT = 5;
    const BORDER_RIGHT = $("#container").width()-5;
    const BONUS = 10;
    var music = 'assets/audio/dont-stop-me-now-8-bit-tribute-to-queen-8-bit-universe.mp3';
    var crash = 'assets/audio/crash.mp3';
    var audio;
    var enemyShowed = null;
    var starShowed = null;
    var borderEvent = false;
    var keys = {};
    var spamEnemies1;
    var spamStars1;
    var puntaje;
    var counter;
    var isRestart = false;

    class Piece {
        constructor (id) {
            this.id = id;
            this.updatePosition();
        }
        getId(){
            return "#"+this.id;
        }
        getPosition () {
            return $( this.getId() ).position();
        }
        getWidht() {
            return $( this.getId() ).width();
        }
        getHeight() {
            return $( this.getId() ).height();
        }
        updatePosition() {
            let pos = this.getPosition();
            this.top = pos.top;
            this.right =  pos.left + this.getWidht();
            this.left = pos.left;
            this.bottom = pos.top + this.getHeight();
        }
        
        collision(piece) {
            this.updatePosition();
            borderEvent = this.left <= BORDER_LEFT || this.right >= BORDER_RIGHT;

           return (((this.top<= piece.bottom && piece.bottom <= this.bottom)
                    || (this.top<= piece.top && piece.top <= this.bottom)) 
                    &&
                    ((this.left <= piece.left && piece.left <= this.right)
                    || (this.left <= piece.right && piece.right <= this.right)))
                    || borderEvent;
        }
    }
    function resetScore(){
        puntaje=0;
        $("#puntuacion").html(puntaje);
    }
    function startCounter(){
        counter=setInterval(function(){
            puntaje++;
            $("#puntuacion").html(puntaje);
          },500);
    }
    function stopCounter(){
        clearInterval(counter);
    }
    function addBonus() {
        puntaje+=BONUS;
        $("#puntuacion").html(puntaje);
    }
    var player = new Piece("car");
    var enemy1 = new Piece("enemy1");
    var enemy2 = new Piece("enemy2");
    var enemy3 = new Piece("enemy3");
    var star1 = new Piece("star1");
    var star2 = new Piece("star2");
    var star3 = new Piece("star3");

    $('#volumen').on("change mousemove", function() {
        audio.volume =$(this).val();
        crashEffect.volume =$(this).val();
    });
    function hiScores(params) {
        //to do
        $('#myModal').modal('show');
        $('#saveScore').click(function() {
        $('#myModal').modal('toggle');
        $('#ranking').modal('toggle');
      });
    }
    
    /* Metodos de carrera*/
    $("#start").click(function() {
        startRace();
    });
    function startRace() {
        refresh();
        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);
        $("#car").show();
        audio = new Audio(music);
        audio.volume =0.03;
        audio.addEventListener("ended", function(){
            audio.currentTime = 0;
       });
        audio.play();
        crashEffect = new Audio(crash);
        crashEffect.volume =0.03;
        spamEnemies();
        spamStars();
        checkCollisions();
        keysRestore();
        isRestart = false;
        mover();
        startCounter();
    }
    /*Vuelve los parametros a sus valores iniciales */
    function refresh(){
        if(enemyShowed){
            $("#enemy"+enemyShowed).removeClass("pause");
            $("#enemy"+enemyShowed).removeClass("carExplosion");
            $("#enemy"+enemyShowed).removeClass("enemy enemies");
            $("#enemy"+enemyShowed).hide();
            enemyShowed=null;
        }
        if(starShowed){
            $("#star"+starShowed).removeClass("pause");
            $("#star"+starShowed).removeClass("star fall");
            $("#star"+starShowed).hide();
        }
        resetScore();
        $("#car").addClass("player");

        resetScore();
        $("#container").removeClass("pause");
        $("#container").addClass("carrera");
        $("#start").hide();
        $("#car").removeClass("carExplosion");
    }

    function removeListeners(){
        document.removeEventListener("keydown", keyDown, false);
        document.removeEventListener("keyup", keyUp, false);
    }

    /* EVENTOS de mouse*/
    function keyUp(event) {
        keys[event.which] = false;
    }
    function keyDown(event) {
        keys[event.which] = true;
        event.preventDefault();
    }
    function keysRestore() {
        keys[37] = false;
        keys[39] = false;
        keys[38] = false;
        keys[40] = false;
    }
    function mover() {
        //left
        if(keys[37]){
            moveArrowSide(player.id,-CANT_PIXELS_MOV_SIDE);
        }
        //Right
        if(keys[39]){
            moveArrowSide(player.id,CANT_PIXELS_MOV_SIDE);
        }
        //Up
        if(keys[38]){
            moveArrowTop(player.id,-CANT_PIXELS_MOV_TOP);
        }
        //Down
        if(keys[40]){
            moveArrowTop(player.id,CANT_PIXELS_MOV_TOP);
        }
        if(!isRestart){setTimeout(mover, 20);}
    }
    function moveArrowSide(id,cant) {
        let element = document.getElementById(id);
        let containter= document.getElementById(CONTAINER);
        let base = element.style.left;
       if(base=== ""){
            base = 140;
        }
        let sum = parseInt(base)+cant;
        if(sum >= 0 && sum <= containter.offsetWidth - element.offsetWidth ){
            element.style.left = sum + 'px';
        }
    }
    function moveArrowTop(id,cant) {
        let element = document.getElementById(id);
        let containter= document.getElementById(CONTAINER);
        let base = element.style.top;
        if(base=== ""){
            base = 365;
        }
        let sum = parseInt(base)+cant;
        if(sum >= 0 && sum <= containter.offsetHeight - element.offsetHeight ){
            element.style.top = sum + 'px';
        }
    }

    /*EVENTOS de colisiones*/
    function spamEnemies() {
        spamEnemies1 = setInterval(showEnemy, 2000);
    }
    function showEnemy() {
      let i = getRandomInt(1,CANT_ENEMIES);
      if(enemyShowed){
        $("#enemy"+enemyShowed).hide();
        $("#enemy"+enemyShowed).removeClass("enemy enemies");
      }
      $("#enemy"+i).show();
      $("#enemy"+i).addClass("enemy enemies");

      enemyShowed=i;
    }

    function spamStars() {
        spamStars1 = setInterval(spamStar, 2000);
    }
    function spamStar() {
      let i = getRandomInt(1,CANT_ENEMIES);
      if(enemyShowed){
        while (i==enemyShowed) {
            i = getRandomInt(1,CANT_ENEMIES);
        }
        if(starShowed){
            $("#star"+starShowed).hide();
            $("#star"+starShowed).removeClass("star fall");
        }
        $("#star"+i).show();
        $("#star"+i).addClass("star fall");
        starShowed=i;
      }
    }

    function checkCollisions() {
        collisions = setInterval(checkCollision, 100);
    }
    function restart(){
        borderEvent=false;
        $("#start").show();
        
    }
    function checkCollision() {
        if (detectCollision()){
            isRestart=true;
            removeListeners();
            stopCounter();
            if(enemyShowed){
                $("#enemy"+enemyShowed).addClass("pause");
            }
            if(starShowed){
                $("#star"+starShowed).removeClass("star");
                $("#star"+starShowed).addClass("pause");
            }
            clearInterval(spamEnemies1);
            clearInterval(spamStars1);
            clearInterval(collisions);
            $("#container").addClass("pause");
            carExplosion(player.id);
            if (!borderEvent) {
                carExplosion("enemy"+enemyShowed);
            }
            audio.pause();
            playCrash();
            restart();
        } else if (detectBonusCollision()){
            addBonus();
            $("#star"+starShowed).hide();
            $("#star"+starShowed).removeClass("star fall");
        }
    }
    /*Evento de explotar coche coche */
    function carExplosion(id){
        $("#"+id).addClass("carExplosion");
    }
    /*Evento de sonido */
    function playCrash() {
            crashEffect.play();
            setTimeout(function(){
                crashEffect.pause();
            }, 3395.86);
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function detectCollision(){
        let collision = false;
        switch (enemyShowed) {
            case 1:
                enemy1.updatePosition();
                collision = player.collision(enemy1);
            break;
            case 2:
                enemy2.updatePosition();
                collision = player.collision(enemy2);
            break;
            case 3:
                enemy3.updatePosition();
                collision = player.collision(enemy3);
            break;    
            default:
            break;
      }
      return collision;
    }
    function detectBonusCollision(){
        let collision = false;
        switch (starShowed) {
            case 1:
                star1.updatePosition();
                collision = player.collision(star1);
            break;
            case 2:
                star2.updatePosition();
                collision = player.collision(star2);
            break;
            case 3:
                star3.updatePosition();
                collision = player.collision(star3);
            break;    
            default:
            break;
      }
      return collision;
    }
    
})