$( document ).ready(function() {
	var filter = {
		greyscale : function (imageData) {
			let data=imageData.data;
			let gris;
			for (let j = 0; j < data.length; j += 4){
				gris = parseInt((data[j] + data[j + 1] + data[j + 2]) / 3);
				data[j]= data[j+1]= data[j+2]=gris;
			}
			ctx.putImageData(imageData, 0,0);
		},
		sepia : function (imageData) {
			let data=imageData.data;
			let r, g, b;
			for (let j = 0; j < data.length; j += 4){
				r = data[j];
		    	g = data[j+1];
		    	b = data[j+2];
		    	data[ j ] = ( r * .393 ) + ( g *.769 ) + ( b * .189 );
        		data[ j + 1 ] = ( r * .349 ) + ( g *.686 ) + ( b * .168 );
       			data[ j + 2 ] = ( r * .272 ) + ( g *.534 ) + ( b * .131 );
			}
			ctx.putImageData(imageData, 0,0);
		},
		negative : function (imageData) {
			let d=imageData.data;
			for (let j = 0; j < d.length; j += 4){
				let r = d[j];
		    	let g = d[j+1];
		    	let b = d[j+2];
		    	d[ j ] = 255 - r;
        		d[ j + 1 ] = 255 - g;
       			d[ j + 2 ] = 255 - b;
			}
			ctx.putImageData(imageData, 0,0);
		},
		brighten : function (imageData) {
			let light = document.getElementById("brighten").value ;
			let d=imageData.data;
			for (let j = 0; j < d.length; j += 4){
		    	d[ j ] = d[ j ] * light;
        		d[ j + 1 ] = d[ j +1] *light;
       			d[ j + 2 ] = d[ j +2] *light;
			}
			ctx.putImageData(imageData, 0,0);
		},
		matriz : function(imageData, matrix) {
			  let side = Math.round(Math.sqrt(matrix.length));
			  let halfSide = Math.floor(side/2);
			  let src = imageData.data;
			  let w = imageData.width;
			  let h = imageData.height;

			  //Creates new output image
			  let output = ctx.createImageData(w,h);
			  let dst = output.data;

			  for (let y=0; y<h; y++) {
			    for (let x=0; x<w; x++) {
			      let sy = y;
			      let sx = x;
			      let dstOff = (y*w+x)*4;
			      // calculate the weighed sum of the source image pixels that
			      // fall under the convolution matrix
			      let r=0, g=0, b=0, a=0;
			      for (let cy=0; cy<side; cy++) {
			        for (let cx=0; cx<side; cx++) {
			          let scy = sy + cy - halfSide;
			          let scx = sx + cx - halfSide;
			          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
			            let srcOff = (scy*w+scx)*4;
			            let wt = matrix[cy*side+cx];
			            r += src[srcOff] * wt;
			            g += src[srcOff+1] * wt;
			            b += src[srcOff+2] * wt;
			          }
			        }
			      }
			      dst[dstOff] = r;
			      dst[dstOff+1] = g;
			      dst[dstOff+2] = b;
			      dst[dstOff+3] = 255;
			    }
			}
			ctx.putImageData(output, 0,0);
  		},
  		blur : function (imageData) {
			this.matriz(imageData,[ 1/9, 1/9, 1/9,
    						1/9, 1/9, 1/9,
    						1/9, 1/9, 1/9 ]);
		},
		edge : function (imageData) {
			this.matriz(imageData,[  0, 1,  0,
 								   1,  -4, 1,
    							 0, 1,  0 ]);
		},
		saturate : function (imageData) {
			// saturation value. 0 = grayscale, 1 = original
			let saturation = 2;
			let d=imageData.data;

			// constants to determine luminance of red, green and blue
			let luR = 0.3086; 
			let luG = 0.6094;
			let luB = 0.0820;

			let az = (1 - saturation)*luR + saturation;
			let bz = (1 - saturation)*luG;
			let cz = (1 - saturation)*luB;
			let dz = (1 - saturation)*luR;
			let ez = (1 - saturation)*luG + saturation;
			let fz = (1 - saturation)*luB;
			let gz = (1 - saturation)*luR;
			let hz = (1 - saturation)*luG;
			let iz = (1 - saturation)*luB + saturation;

			for(let i = 0; i < d.length; i += 4)
			{
				// Extract original red color [0 to 255]. Similarly for green and blue below
			    let red = d[i]; 
			    let green = d[i + 1];
			    let blue = d[i + 2];

			    let saturatedRed = (az*red + bz*green + cz*blue);
			    let saturatedGreen = (dz*red + ez*green + fz*blue);
			    let saturateddBlue = (gz*red + hz*green + iz*blue);

			    d[i] = saturatedRed;
			    d[i + 1] = saturatedGreen;
			    d[i + 2] = saturateddBlue;
			}
			ctx.putImageData(imageData, 0,0);
		},
		contrast : function (imageData) {//input range [-100..100]
			var contrast = document.getElementById("contrast").value ;
		    var d = imageData.data;
		    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
		    var intercept = 128 * (1 - contrast);
		    for(var i=0;i<d.length;i+=4){   //r,g,b,a
		        d[i] = d[i]*contrast + intercept;
		        d[i+1] = d[i+1]*contrast + intercept;
		        d[i+2] = d[i+2]*contrast + intercept;
		    }
		    ctx.putImageData(imageData, 0,0);
		},
		antialiasing : function (imageData) {
			this.matriz(imageData,[  1, 1,  1,
 								   1,  1, 1,
    							 1, 1,  1 ]);
		}
		
	}

	$("#filtros").change(addEfect);

	$("#contrast").change(function (argument) {
		if(document.getElementById("restore").checked){
			restore();
			$('#filtros').prop('selectedIndex',0);
			$('#brighten').prop('value',1);
		}
		imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
		filter.contrast(imageData);
	});

	$("#brighten").change(function (argument) {
		if(document.getElementById("restore").checked){
			restore();
			$('#filtros').prop('selectedIndex',0);
			$('#contrast').prop('value',0);
		}
		imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
		filter.brighten(imageData);
	});

	$("#restore").click(function (){
		if(document.getElementById("restore").checked){
			restore();
			$('#filtros').prop('selectedIndex',0);
			$('#brighten').prop('value',1);
			$('#contrast').prop('value',0);
		}
	});

	document.getElementById('file-input').addEventListener('change', function(e) {
			var reader = new FileReader();
		    reader.onload = function(event){
		        var img = new Image();
		        img.onload = function(){
		            canvas.width = img.width;
		            canvas.height = img.height;
		            ctx.drawImage(img,0,0);
			        backCanvas.width = canvas.width;
					backCanvas.height = canvas.height;
					backCtx.drawImage(canvas, 0,0);
		        }
		        img.src = event.target.result;
		    }
		    reader.readAsDataURL(e.target.files[0])
			
	}, false);
	
	function addEfect() {

		if(document.getElementById("restore").checked){
			restore();
			$('#brighten').prop('value',1);
			$('#contrast').prop('value',0);
		}
		imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
		selectFilter($("#filtros").val(), imageData);
	}
	

	function selectFilter(efecto, imageData, oldImageData) {
		switch(efecto) {
		    case "negative":
		        filter.negative(imageData);
		        break;
		    case "sepia":
		        filter.sepia(imageData);
		        break;
		    case "binary":
		        filter.greyscale(imageData);
		        break;
		    case "blur":
		    	filter.blur(imageData);
		    	break;
		    case "edge":
		    	filter.edge(imageData);
		    	break;
		    case "saturate":
		    	filter.saturate(imageData);
		    	break;
		    case "antialiasing":
		    	filter.antialiasing(imageData);
		    	break;
		    default:
		}
	}

	function restore() {
		ctx.drawImage(backCanvas, 0,0);
	}

	var ctx = document.getElementById("canvas").getContext("2d");
	var canvas = document.getElementById("canvas");
	var backCanvas = document.createElement('canvas');
	var backCtx = backCanvas.getContext('2d');
}
);