$( document ).ready(function() {
	
	const CELDA_SIZE = 60;
	const CELDA_DISTANCIA = 10;
	const TABLERO_CANT_COLUMNAS = 7;
	const TABLERO_CANT_FILAS = 6;
	const SIN_FICHA= 0;
	const FICHA_AIRE= 1;
	const FICHA_MAR= 2;


	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var inicial=document.createElement('canvas');
	var inicialCtx= inicial.getContext('2d');
	var previo=document.createElement('canvas');
	var previoCtx=previo.getContext('2d');

	var aux=document.createElement('canvas');
	var auxCtx=aux.getContext('2d');

	previo.width = canvas.width;
	previo.height = canvas.height;
	inicial.width = canvas.width;
	inicial.height = canvas.height;

	var imgFicha ;
	var celda;
	var panel;

	class Posicion {
		constructor(x, y, h, w) {
		    this.x = x;
		    this.y = y;
		    this.h = h;
		    this.w = w;
		}
		getCordenadas(){
			return x+","+y;
		}
	}

	class Zone {
		/*
			p1 ---- p2
			|       |
			p3 ---- p4
		*/
		constructor(p1){
			this.p1=p1;
		}
		isInZone(x,y){
			return x<=this.p1.x+this.p1.w && x>=this.p1.x && y>=this.p1.y && y<=this.p1.y+this.p1.h;
		}
	}

	class Celda {
	  constructor(x, y, w, h, v) {
	    this.posicion = new Posicion(x,y,w,h);
	    this.value = v;
	  }
	  draw (image) {
			ctx.drawImage(image, this.posicion.x, this.posicion.y, this.posicion.w, this.posicion.h);
		}
	}
	class ColumnaInfo {
		constructor(w,celdaLibre) {
			this.w = w;
			this.celdaLibre = celdaLibre;
		}
		belongs(x){
			if (x <= this.w){
				return true;
			} return false;
		}
		getRow(){
			return this.celdaLibre; //puede ser null
		}
		next(){
			this.celdaLibre--;
		}
		setNull(){
			this.celdaLibre=null;
		}
	}

	var tablero = {
		totalCeldas: null,
		h: null,
		w: null,
		contenido: null,

		puntajeAire: 0,
		puntajeMar: 0,
		turno: "air",

		celda: null,
		air: null,
		sea: null,

		airZone:null,
		dropZone: null,

		winner:null,

		init : function (x,y) {
			this.totalCeldas=x*y;
			this.h=y;
			this.w=x;

			this.airZone= new Zone(new Posicion(625,66,115,173));
			this.seaZone= new Zone(new Posicion(599,245,164,220));
			this.dropZone= new Zone(new Posicion(0,0,410,480));
					
			this.loadCell();
		},
		loadCell :  function () {
			var celda = new Image();
		    celda.onload = function () {
		    	tablero.celda=celda;
		    	tablero.loadAir();
		    }
		    celda.src = "cuadrado.png";
		},
		loadAir : function (argument) {
			var air = new Image();
			air.onload = function () {
				tablero.air=air;
				tablero.loadSea();
			}
			air.src ="fichaAire.png";
		},
		loadSea : function (argument) {
			var sea = new Image();
			sea.onload = function () {
				tablero.sea=sea;
				tablero.loadPanel();
			}
			sea.src ="fichaMar.png";
		},
		loadPanel :  function () {
			var panel = new Image();
			panel.onload = function () {
				tablero.panel=panel;
				tablero.render();
			}
			panel.src ="panel.png";
		},
		render :  function () {
			ctx.drawImage(this.panel, 570, 0, 280, 420);

			let fila=[this.h];
			let columna=[this.w];
			this.columnaInfo =[this.w];
			let xc = 0;
			let yc = 0;
			let firstColumn=false;
			for (let i = 0; i < this.h; i++) {
				for (let j= 0; j < this.w; j++) {
					columna[j] = new Celda(xc,yc,CELDA_SIZE,CELDA_SIZE,0);
					columna[j].draw(this.celda);
					xc=xc+CELDA_SIZE+CELDA_DISTANCIA;
					if (!firstColumn){
						this.columnaInfo[j] = new ColumnaInfo(xc-CELDA_DISTANCIA/2,this.h-1);
					}
				}
				firstColumn=true;
				xc=0;
				yc=yc+CELDA_SIZE+CELDA_DISTANCIA;
			 	fila[i] = columna;
			 	columna=[];
				}
			this.contenido=fila;

			inicialCtx.drawImage(canvas, 0,0,canvas.width,canvas.height);
			previoCtx.drawImage(canvas, 0,0,canvas.width,canvas.height);
			this.drawAir();

			
		},
		drawAir :function () {
			ctx.drawImage(this.air, 683, 80, CELDA_SIZE, CELDA_SIZE);
			ctx.drawImage(this.air, 625, 100, CELDA_SIZE, CELDA_SIZE);
			ctx.drawImage(this.air, 741, 100, CELDA_SIZE, CELDA_SIZE);
		},
		refresh : function () {
			this.totalCeldas=this.h*this.w;
			previoCtx.clearRect(0, 0, canvas.width, canvas.height);
			previoCtx.drawImage(inicial, 0,0,canvas.width,canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(inicial, 0,0,canvas.width,canvas.height);
            let fila=[this.h];
			let columna=[this.w];
			this.columnaInfo =[this.w];
			let xc = 0;
			let yc = 0;
			let firstColumn=false;
			for (let i = 0; i < this.h; i++) {
				for (let j= 0; j < this.w; j++) {
					columna[j] = new Celda(xc,yc,CELDA_SIZE,CELDA_SIZE,0);
					xc=xc+CELDA_SIZE+CELDA_DISTANCIA;
					if (!firstColumn){
						this.columnaInfo[j] = new ColumnaInfo(xc-CELDA_DISTANCIA/2,this.h-1);
					}
				}
				firstColumn=true;
				xc=0;
				yc=yc+CELDA_SIZE+CELDA_DISTANCIA;
			 	fila[i] = columna;
			 	columna=[];
				}
			this.contenido=fila;
			this.turno ="air";
			this.winner=null;
			this.drawAir();

		},

		insert : function (x) {
			let found = false;
			let row = null;
			let column = null;
			for (let k=0; k< this.w && !found; k++){
				if (this.columnaInfo[k].belongs(x)){
					found =true;
					column = k;
					row = this.columnaInfo[k].getRow();
				}
			}
			if (found && row != null){
				this.contenido[row][column].value = this.getPlayer();
				this.contenido[row][column].draw(this.getImage());
				this.totalCeldas--;
				previoCtx.clearRect(0, 0, canvas.width, canvas.height);
				previoCtx.drawImage(canvas, 0,0);
				if (row == 0){
					this.columnaInfo[column].setNull();
				} else {
					this.columnaInfo[column].next();
				}
				this.setTurno();
				this.setWinner(column,row);
			}
		},
		isFull : function () {
			return contenido == 0 ? true : false;
		},
		getImage : function () {
			if(this.turno == "air"){
				return this.air;
			} return this.sea;
		},
		getPlayer : function () {
			if(this.turno == "air"){
				return 1;
			} return 2;
		},
		setTurno :function () {
			if(this.turno == "air"){
				this.turno = "sea";
				ctx.drawImage(this.sea, 683, 280, CELDA_SIZE, CELDA_SIZE);
				ctx.drawImage(this.sea, 625, 300, CELDA_SIZE, CELDA_SIZE);
				ctx.drawImage(this.sea, 741, 300, CELDA_SIZE, CELDA_SIZE);
			} else {
				this.turno = "air";
				this.drawAir();;

			}
		},
		get: function (x,y) {
			return this.contenido[y][x].value;
		},
		setPuntaje: function (argument) {
			if(this.winner == 1){
				this.puntajeAire++;
			} else {
				this.puntajeMar++;
			}
		},
		setWinner : function (x,y) {
			let horizontal=1;
			let vertical=1;
			let diagonalDer=1;
			let diagonalIzq=1;

			for (let i=x+1;i< tablero.w; i++){
				if (this.get(i,y) == this.get(x,y)){
					horizontal++;
				} else {break;}
			}
			for (let i=x-1;i>=0; i--){
				if (this.get(i,y) == this.get(x,y)){
					horizontal++;
				} else {break;}
			}

			for (let i=y+1;i< tablero.h; i++){
				if (this.get(x,i) == this.get(x,y)){
					vertical++;
				} else {break;}
			}
			for (let i=y-1;i>=0; i--){
				if (this.get(x,i) == this.get(x,y)){
					vertical++;
				} else {break;}
			}
			for (let i=x-1, j=y+1 ;i>=0 && j< tablero.h ; i--, j++){
				if (this.get(i,j) == this.get(x,y)){
					diagonalIzq++;
				} else {break;}
			}
			for (let i=x+1, j=y-1 ;i<tablero.w && j>=0 ; i++, j--){
				if (this.get(i,j) == this.get(x,y)){
					diagonalIzq++;
				} else {break;}
			}

			for (let i=x+1, j=y+1 ;i<tablero.w && j< tablero.h ; i++, j++){
				if (this.get(i,j) == this.get(x,y)){
					diagonalDer++;
				} else {break;}
			}
			for (let i=x-1, j=y-1 ;i>=0 && j>=0 ; i--, j--){
				if (this.get(i,j) == this.get(x,y)){
					diagonalDer++;
				} else {break;}
			}

			if (vertical == 4 || horizontal==4 || diagonalDer==4 || diagonalIzq == 4) {
				this.winner = this.get(x,y);
				this.setPuntaje();
				dragEnabled=false;
			}
		},
		getWinner(){
			if(this.winner == 1){
				return "air";
			} else {
				return "sea";
			}
		}
	}


	var mousePressed=false;
	var dragEnabled=true;
	function drag(ev) {
		
		let x, y;
		x = ev.clientX - this.offsetLeft - CELDA_SIZE/2;
		y = ev.clientY - this.offsetTop - CELDA_SIZE/2;
		if(dragEnabled&&tablero.turno =="air" && tablero.airZone.isInZone(ev.clientX - this.offsetLeft,ev.clientY - this.offsetTop)){
			canvas.addEventListener("mousemove",move);
			ctx.drawImage(tablero.air,x, y,CELDA_SIZE,CELDA_SIZE);
			mousePressed = true;
		}
		if(dragEnabled&&tablero.turno =="sea" && tablero.seaZone.isInZone(ev.clientX - this.offsetLeft,ev.clientY - this.offsetTop)){
			canvas.addEventListener("mousemove",move);
			ctx.drawImage(tablero.sea,x, y,CELDA_SIZE,CELDA_SIZE);
			mousePressed = true;
		}
		
	}
	function move(ev) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(previo, 0,0,canvas.width,canvas.height);
		let x, y;
		if (mousePressed){
			x = ev.clientX - this.offsetLeft - CELDA_SIZE/2;
			y = ev.clientY - this.offsetTop - CELDA_SIZE/2;
			ctx.drawImage(tablero.getImage(),x, y,CELDA_SIZE,CELDA_SIZE);
		}
		
	}
	function drop(ev) {
		event.preventDefault();
		if(mousePressed && tablero.dropZone.isInZone(ev.clientX - this.offsetLeft,ev.clientY - this.offsetTop)){

			mousePressed=false;
			canvas.removeEventListener("mousemove",move);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(previo, 0,0,canvas.width,canvas.height);
			tablero.insert(ev.clientX - this.offsetLeft);
			if (tablero.winner !=null) {
				document.getElementById("puntajeAire").innerHTML =tablero.puntajeAire;
				document.getElementById("puntajeMar").innerHTML =tablero.puntajeMar;
				let confirm = document.getElementById("confirm");
				if(tablero.getWinner()=="air"){
					confirm.classList.remove("seaWinner");
					confirm.classList.add("airWinner");
				} else {
					confirm.classList.remove("airWinner");
					confirm.classList.add("seaWinner");
				}
				
				functionAlert();
			} else if(tablero.totalCeldas==0) {
				functionAlert("No winner :( " );
			}
		}
		
	}

	function print(ev) {
		let x, y;
		x = ev.clientX - this.offsetLeft;
		y = ev.clientY - this.offsetTop;
		console.log("x:"+x+" y:"+y);
	}
	function functionAlert(msg, myYes) {
            var confirmBox = $("#confirm");
            confirmBox.find(".message").text(msg);
            confirmBox.find(".yes").unbind().click(function() {
               confirmBox.hide();
               dragEnabled=true;
               tablero.refresh();
            });
            confirmBox.find(".yes").click(myYes);
            confirmBox.show();
         }

	canvas.addEventListener("mousedown",drag);
	canvas.addEventListener("mouseup",drop);
	//canvas.addEventListener("click",print);
	
	tablero.init(TABLERO_CANT_COLUMNAS,TABLERO_CANT_FILAS);
});






