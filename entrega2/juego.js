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

		puntajeAire: null,
		puntajeMar: null,
		turno: "air",

		celda: null,
		air: null,
		sea: null,

		airZone:null,
		dropZone: null,

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
			this.greySea();

			inicialCtx.drawImage(canvas, 0,0);
			previoCtx.drawImage(canvas, 0,0);
		},
		greySea : function () {
			ctx.drawImage(this.air, 625, 100, CELDA_SIZE, CELDA_SIZE);
			ctx.drawImage(this.air, 683, 80, CELDA_SIZE, CELDA_SIZE);
			ctx.drawImage(this.air, 740, 100, CELDA_SIZE, CELDA_SIZE);
			this.greyscale(this.sea, 640,302);

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
			}
		},

		get : function (x,y) {
			return contenido[y][x];
		},
		set : function (x,y,k) {
			contenido[y,x]=k;
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
			} else {
				this.turno = "air";
			}
		},
		greyscale : function (imageData, x,y) {
			let data=imageData.data;
			let gris;
			for (let j = 0; j < data.length; j += 4){
				gris = parseInt((data[j] + data[j + 1] + data[j + 2]) / 3);
				data[j]= data[j+1]= data[j+2]=gris;
			}
			ctx.putImageData(imageData, x,y);
		},
	}


	var mousePressed;
	function drag(ev) {
		
		let x, y;
		x = ev.clientX - this.offsetLeft - CELDA_SIZE/2;
		y = ev.clientY - this.offsetTop - CELDA_SIZE/2;
		if(tablero.turno =="air" && tablero.airZone.isInZone(ev.clientX - this.offsetLeft,ev.clientY - this.offsetTop)){
			canvas.addEventListener("mousemove",move);
			ctx.drawImage(tablero.air,x, y,CELDA_SIZE,CELDA_SIZE);
			mousePressed = true;
		}
		if(tablero.turno =="sea" && tablero.seaZone.isInZone(ev.clientX - this.offsetLeft,ev.clientY - this.offsetTop)){
			canvas.addEventListener("mousemove",move);
			ctx.drawImage(tablero.sea,x, y,CELDA_SIZE,CELDA_SIZE);
			mousePressed = true;
		}
		
	}
	function move(ev) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(previo, 0,0);
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
			canvas.removeEventListener("mousemove",move);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(previo, 0,0);
			tablero.insert(ev.clientX - this.offsetLeft);
		}
		mousePressed=false;
	}

	function print(ev) {
		let x, y;
		x = ev.clientX - this.offsetLeft;
		y = ev.clientY - this.offsetTop;
		console.log("x:"+x+" y:"+y);
	}

	canvas.addEventListener("mousedown",drag);
	canvas.addEventListener("mouseup",drop);
	canvas.addEventListener("click",print);
	


	tablero.init(TABLERO_CANT_COLUMNAS,TABLERO_CANT_FILAS);
});






function functionAlert(msg, myYes) {
            var confirmBox = $("#confirm");
            confirmBox.find(".message").text(msg);
            confirmBox.find(".yes").unbind().click(function() {
               confirmBox.hide();
            });
            confirmBox.find(".yes").click(myYes);
            confirmBox.show();
         }