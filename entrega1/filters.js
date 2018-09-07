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
			let d=imageData.data;
			for (let j = 0; j < d.length; j += 4){
		    	d[ j ] += 100;
        		d[ j + 1 ] += 100;
       			d[ j + 2 ] += 100;
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
		antialiasing : function (argument) {
			let d=imageData.data;
			for (let j = 0; j < d.length; j += 4){
		    	d[ j + 3 ] -= 100;
			}
			ctx.putImageData(imageData, 0,0);
		}
	}

	$("#filtros").change(addEfect);
	
	function addEfect() {
		imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
		let oldImageData = ctx.getImageData(0,0, canvas.width, canvas.height);
		selectFilter($("#filtros").val(), imageData, oldImageData);
	}
	

	function selectFilter(efecto, imageData, oldImageData) {
		switch(efecto) {
		    case "negative":
		        filter.negative(imageData);
		        break;
		    case "sepia":
		        filter.sepia(imageData);
		        break;
		    case "brighten":
		        filter.brighten(imageData);
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
	var ctx = document.getElementById("canvas").getContext("2d");
	var canvas = document.getElementById("canvas");
}
);