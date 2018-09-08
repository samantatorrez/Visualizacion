$( document ).ready(function() {
		var ctx = document.getElementById("canvas").getContext("2d");
		var canvas = document.getElementById("canvas");
		var erase = false;
		var ruber = '#FFFFFF';
		ctx.lineCap="round";
		ctx.lineWidth= 5;

		var point = {
			x : null,
			y : null,
			isNull : function () {
				return this.x==null || this.y==null;
			},
			setNull : function() {
				this.x = null;
				this.y = null;
			}
		};
		
		$("#lapiz").click(function (){
			$(this).addClass('selectedIMG');
			$("#goma").removeClass('selectedIMG');
			erase = false;
		});
		$("#goma").click(function (){
			$(this).addClass('selectedIMG');
			$("#lapiz").removeClass('selectedIMG');
			erase = true;
		});
		$("#nuevo").click(function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		});
		$("#imagen").click(function () {
			$('#file-input').trigger('click');
		});

		document.getElementById('download').addEventListener('click', function() {
			let filename = prompt ("Guardar como...");
			if (filename == null || filename =="" ){
				return;
			} 
    		this.href = canvas.toDataURL();
   			this.download = filename +'.png';
		}, false);

		 function init(container) {
	        // bind mouse events
	        canvas.onmousemove = function(e) {
	        	ctx.lineCap="round";
				ctx.lineWidth= 5;
	            if (!canvas.isDrawing) {
	               return;
	            }
	            ctx.strokeStyle= $("#color").val();
	            if(erase){
	            	ctx.strokeStyle= ruber;
	            }

	            if (!point.isNull()){
	            	ctx.beginPath();
					ctx.moveTo(point.x,point.y);
					ctx.lineTo(e.layerX,e.layerY);
					ctx.stroke();
					ctx.closePath();
	            } 
	            
	            point.x=e.layerX;
	            point.y=e.layerY;
	        };
	        canvas.onmousedown = function(e) {
	        	ctx.lineCap="round";
				ctx.lineWidth= 5;
	            canvas.isDrawing = true;
	            ctx.strokeStyle= $("#color").val();
	            if(erase){
	            	ctx.strokeStyle= ruber;
	            }
	            ctx.beginPath();
				ctx.moveTo(e.layerX,e.layerY);
				ctx.lineTo(e.layerX,e.layerY);
				ctx.stroke();
				ctx.closePath();
	        };
	        canvas.onmouseup = function(e) {
	            canvas.isDrawing = false;
	            point.setNull();
	        };
    	}

    init(canvas);

});