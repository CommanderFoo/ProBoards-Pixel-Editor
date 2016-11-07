class Pixel_Images {

	constructor(){
		this.lookup = new Map();
		this.cell_size = 20;

		this.canvas_prep = $("<canvas width='580' height='380'></canvas>").get(0);
		this.context = this.canvas_prep.getContext("2d");
		this.canvas_width = this.canvas_prep.width;
		this.canvas_height = this.canvas_prep.height;

		this.columns = ~~ (this.canvas_prep.width / this.cell_size);
		this.rows = ~~ (this.canvas_prep.height / this.cell_size);
	}

	create(data = {}, $content, post_id){
		if($content.length != 1){
			return;
		}

		if(data){
			if(data.a && data.a.length > 2){
				let img = new Image();

				if(!this.lookup.has(data.k)){
					this.clear();

					let parts = data.a.split(",");
					let highest_trans_pixel = -1;
					let lowest_trans_pixel = -1;

					for(let c = 0; c < this.columns; c ++){
						for(let r = 0; r < this.rows; r ++){
							let i = (c * this.rows) + r;
							let color = "";

							if(parts[i].length > 1){
								if(parts[i].length){
									color = "#" + parts[i];
								}

								if(!color.match(/^[#A-Za-z0-9]+$/)){
									color = "";
								}
							}

							this.fill(color, c, r);
						}
					}

					this.trim();

					let base64 = this.canvas_prep.toDataURL();

					img.src = base64;

					this.lookup.set(data.k, img);
				} else {
					img = this.lookup.get(data.k);
				}

				let style = "";

				if(data.s){
					let w = this.canvas_width - (this.canvas_width * data.s / 100);
					let h = this.canvas_height - (this.canvas_height * data.s / 100);

					style = " style='width: " + w + "px; height: " + h + "px;'";
				}

				let div = $("<div><img" + style + " src='" + img.src + "' /></div>").addClass("pixel-editor-user-art").attr("data-pixel-editor-post-id", parseInt(post_id, 10));

				div.find("img").attr("data-pixel-editor-key", yootil.html_encode(data.k));
				div.insertAfter($content.find("article"));
			}
		}
	}

	clear(){
		this.canvas_prep.width = this.canvas_width;
		this.canvas_prep.height = this.canvas_height;
		this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
		this.context.fillStyle = "transparent";
		this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
	}

	fill(data = "", grid_x = -1, grid_y = -1){
		if(grid_x > -1 && grid_y > -1){
			if(!data){
				this.context.clearRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
			} else {
				this.context.fillStyle = data;
				this.context.fillRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
			}
		}
	}

	trim(image_data = null, canvas_context = null){
		let width = this.canvas_width;
		let	height = this.canvas_height;
		let ctx = (canvas_context)? canvas_context : this.context;
		let data = (image_data)? image_data.data : this.context.getImageData(0, 0, width, height).data;

		let min_x = -1;
		let max_x = -1;
		let min_y = -1;
		let max_y = -1;

		// Credit to potomek, http://stackoverflow.com/a/22267731/5941389 for the base algorithm
		// Difference here is the sort can be dropped for a bit of efficiency, and fixed
		// 1px cropping issue for width and height by adding them back

		for(let y = 0; y < height; y ++){
			for(let x = 0; x < width; x ++){

				// Data contains rgba, so every 4 is a color

				let i = (y * width + x) * 4;

				// Check if alpha is not transparent

				if(data[i + 3] > 0){
					min_x = (min_x == -1)? x : Math.min(min_x, x);
					min_y = (min_y == -1)? y : Math.min(min_y, y);

					max_x = Math.max(max_x, x);
					max_y = Math.max(max_y, y);
				}
			}
		}

		//console.log(min_x, max_x, min_y, max_y);

		// Put cutout image onto canvas

		let img = ctx.getImageData(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1);

		// Resize canvas to new size

		this.canvas_prep.width = max_x - min_x + 1;
		this.canvas_prep.height = max_y - min_y + 1;

		this.context.putImageData(img, 0, 0);

		//$("body").append($(this.canvas_prep))

		if(data){
			return this.canvas_prep.toDataURL();
		}
	}

}