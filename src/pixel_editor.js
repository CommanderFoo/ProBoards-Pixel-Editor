class Pixel_Editor {

	constructor({bin = ""} = {}){
		this.cell_info = new Map();

		this.selected_color = "#000";
		this.grid_on = true;
		this.cell_size = 20;
		this.bin_16_icon = bin;

		this.is_erasing_color = false;
		this.is_mirroring = false;
		this.is_filling = false;

		this.undo_manager = new Undo_Manager();
		this.file_manager = new File_Manager();
	}

	init({canvas_selector = "#pixel-editor-canvas", controls_selector = "#pixel-editor-canvas-controls"} = {}){
		this.canvas = $(canvas_selector).get(0);

		if(!this.canvas || !this.canvas.getContext("2d")){
			console.warn("Pixel Editor: No canvas object / context");

			return;
		}

		this.controls = $(controls_selector);

		if(!this.controls.length ){
			console.warn("Pixel Editor: No controls element");

			return;
		}

		this.canvas_width = this.canvas.width;
		this.canvas_height = this.canvas.height;
		this.context = this.canvas.getContext("2d");

		this.context.globalAlpha = 1;

		this.columns = ~~ (this.canvas_width / this.cell_size);
		this.rows = ~~ (this.canvas_height / this.cell_size);

		this.create_controls();
		this.add_events();
		this.init_map();
		this.create_art();

		this.export_dialog = null;
		this.import_dialog = null;

		this.save_as_dialog = null;
		this.overwrite_dialog = null;

		this.file_list_dialog = null;
	}

	init_map(){
		for(let h = 0; h < this.columns; h ++){
			for(let v = 0; v < this.rows; v ++){
				this.cell_info.set(h + "_" + v, "");
			}
		}
	}

	create_controls(){
		this.controls_color = this.controls.find("#pixel-editor-color-picker");
		this.controls_grid = this.controls.find("#pixel-editor-grid");
		this.controls_erase_color = this.controls.find("#pixel-editor-erase");
		this.controls_clear = this.controls.find("#pixel-editor-clear");
		this.controls_undo = this.controls.find("#pixel-editor-undo");
		this.controls_redo = this.controls.find("#pixel-editor-redo");
		this.controls_import = this.controls.find("#pixel-editor-import");
		this.controls_export = this.controls.find("#pixel-editor-export");
		this.controls_mirror = this.controls.find("#pixel-editor-mirror");
		this.controls_save = this.controls.find("#pixel-editor-save");
		this.controls_save_as = this.controls.find("#pixel-editor-save-as");
		this.controls_open = this.controls.find("#pixel-editor-open");
		this.controls_drag = this.controls.find("#pixel-editor-drag-to");
		this.svg_grid = $("#pixel-editor-grid-svg");
		this.controls_fill_color = this.controls.find("#pixel-editor-color-fill");
		this.status_bar = this.controls.find("#pixel-editor-status-info");

		this.controls_open.on("click", this.open.bind(this));
		this.controls_save.on("click", this.save.bind(this));
		this.controls_save_as.on("click", this.save_as.bind(this));

		this.controls_mirror.on("click", () => {
			if(this.is_mirroring){
				this.controls_mirror.attr("title", "Mirror");
				this.controls_mirror.removeClass("pixel-editor-active-control");
				this.is_mirroring = false;
				this.set_status("Mirroring turned off.");
			} else {
				this.controls_mirror.attr("title", "Turn Off Mirror");
				this.controls_mirror.addClass("pixel-editor-active-control");
				this.is_mirroring = true;
				this.set_status("Mirroring turned on.");
			}
		});

		this.controls_export.on("click", () => {
			if(!this.export_dialog){
				this.create_export_dialog();
			} else {
				this.export_dialog.dialog("open");
			}
		});

		this.controls_import.on("click", () => {
			if(!this.import_dialog){
				this.create_import_dialog();
			} else {
				this.import_dialog.dialog("open");
			}
		});

		this.controls_color.on("click", (obj) => {
			if(this.is_erasing_color){
				this.controls_erase_color.trigger("click");
			}
		});

		this.controls_grid.on("click", () => {
			if(this.grid_on){
				this.controls_grid.attr("title", "Show Grid");
				this.controls_grid.removeClass("pixel-editor-active-control");
				this.remove_grid();
				this.set_status("Grid turned off.");
			} else {
				this.controls_grid.attr("title", "Hide Grid");
				this.controls_grid.addClass("pixel-editor-active-control");
				this.show_grid();
				this.set_status("Grid turned on.");
			}
		});

		this.controls_clear.on("click", () => {
			this.cell_info.clear();
			this.init_map();
			this.clear();
			this.show_grid();
			this.undo_manager.clear();
			this.update_redo_undo_btns();
			this.file_manager.close();
			this.controls.dialog_tweaks("option", "title", "Pixel Editor");
			this.update_drag(false);

			if(this.is_erasing_color){
				this.controls_erase_color.trigger("click");
			}

			if(this.is_filling){
				this.controls_fill_color.trigger("click");
			}

			this.set_status("Canvas has been cleared, you can't undo this action.");
		});

		this.controls_fill_color.on("click", () => {
			if(this.is_filling){
				this.is_filling = false;
				this.controls_fill_color.removeClass("pixel-editor-active-control");
				this.set_status("Fill color turned off.");

				return;
			}

			this.controls_fill_color.addClass("pixel-editor-active-control");
			this.is_filling = true;

			let color = "transparent";

			if(this.selected_color != ""){
				color = "<span style='color: " + this.selected_color + "'>" + this.selected_color + "</span>";
			}

			this.set_status("Fill color turned on using color \"" + color + "\".  <strong>Warning: </strong> You can't undo this action.");
		});

		this.controls_erase_color.on("click", () => {
			if(this.is_erasing_color){
				this.is_erasing_color = false;
				this.controls_erase_color.removeClass("pixel-editor-active-control");
				this.set_status("Eraser turned off.");

				return;
			}

			this.controls_erase_color.addClass("pixel-editor-active-control");
			this.is_erasing_color = true;
			this.set_status("Eraser turned on.");
		});

		this.controls_undo.on("click", () => {
			this.undo_manager.undo();
			this.update_drag(false);
			this.controls.dialog_tweaks("option", "title", "*Pixel Editor");
			this.update_redo_undo_btns();
		});

		this.controls_redo.on("click", () => {
			this.undo_manager.redo();
			this.update_drag(false);
			this.update_redo_undo_btns();
		});
	}

	create_export_dialog(){
		let html = "<div><textarea id='pixel-editor-export-data-area' style='width: 100%; height: 100%'></textarea></div>";

		this.export_dialog = $(html).dialog({

			title: "Exporting Data",
			resizable: false,
			draggable: false,
			modal: true,
			width: 500,
			height: 400,
			dialogClass: "pixel-editor-dialog",
			open: () => {
				$("#pixel-editor-export-data-area").val(this.data).select();

			}

		});
	}

	create_import_dialog(){
		let html = "<div><textarea id='pixel-editor-import-data-area' style='width: 100%; height: 100%'></textarea></div>";

		this.import_dialog = $(html).dialog({

			title: "Importing Data",
			resizable: false,
			draggable: false,
			modal: true,
			width: 500,
			height: 400,
			dialogClass: "pixel-editor-dialog",
			open: () => {
				$("#pixel-editor-import-data-area").val("");
			},

			buttons: {

				"Import Data": () => {
					this.data = $("#pixel-editor-import-data-area").val();
					this.import_dialog.dialog("close");
					this.controls.dialog_tweaks("option", "title", "*Pixel Editor");
				}

			}

		});
	}

	add_events(){
		$(this.canvas).on("click", (e) => {
			if(this.is_filling){
				this.fill_canvas();
				return;
			}

			let mouse_x = e.offsetX;
			let mouse_y = e.offsetY;

			let cell_x = ~~ (mouse_x / this.cell_size);
			let cell_y = ~~ (mouse_y / this.cell_size);

			if (cell_x < 0 || cell_x >= this.canvas_width || cell_y < 0 || cell_y >= this.canvas_height){
				return;
			}

			this.update_drag(false);
			this.controls.dialog_tweaks("option", "title", "*Pixel Editor");

			let current_data = this.cell_info.get(cell_x + "_" + cell_y);
			let new_data = (this.is_erasing_color)? "" : this.selected_color;
			let current_mirror_data = "";
			let mirror_x = "";

			this.cell_info.set(cell_x + "_" + cell_y, new_data);

			if(this.is_mirroring){
				if(cell_x < (this.total_columns / 2)){
					mirror_x = ((this.total_columns - 1) - cell_x);
					current_mirror_data = this.cell_info.get(mirror_x + "_" + cell_y);

					this.cell_info.set(mirror_x + "_" + cell_y, new_data);
					this.fill(new_data, mirror_x, cell_y);
				}
			}

			this.undo_manager.add({

				undo: () => {
					this.cell_info.set(cell_x + "_" + cell_y, current_data);
					this.fill(current_data, cell_x, cell_y);

					if(mirror_x){
						this.cell_info.set(mirror_x + "_" + cell_y, current_mirror_data);
						this.fill(current_mirror_data, mirror_x, cell_y);
					}
				},

				redo: () => {
					this.cell_info.set(cell_x + "_" + cell_y, new_data);
					this.fill(new_data, cell_x, cell_y);

					if(mirror_x){
						this.cell_info.set(mirror_x + "_" + cell_y, new_data);
						this.fill(new_data, mirror_x, cell_y);
					}
				}

			});

			this.fill(new_data, cell_x, cell_y);
			this.update_redo_undo_btns();
		});
	}

	fill_canvas(){
		this.update_drag(false);

		for(let c = 0; c < this.columns; c ++){
			for(let r = 0; r < this.rows; r ++){
				this.cell_info.set(c + "_" + r, this.selected_color);
				this.fill(this.selected_color, c, r);
			}
		}

		this.controls.dialog_tweaks("option", "title", "*Pixel Editor");

		let color = "transparent";

		if(this.selected_color != ""){
			color = "<span style='color: " + this.selected_color + "'>" + this.selected_color + "</span>";
		}

		this.set_status("Canvas filled using color \"" + color + "\".");
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

	clear(){
		this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
		this.context.fillStyle = "transparent";
		this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
	}

	remove_grid(){
		this.grid_on = false;
		this.svg_grid.hide();
	}

	create_art(){
		this.cell_info.forEach((data, key) => {
			let [x, y] = key.split("_");

			this.fill(data, x, y);
		});
	}

	refresh(){
		this.clear();
		this.create_art();
	}

	show_grid(){
		this.grid_on = true;
		this.svg_grid.show();
	}

	update_redo_undo_btns(){
		if(this.undo_manager.can_undo()){
			this.controls_undo.css("opacity", 1)
		} else {
			this.controls_undo.css("opacity", .5)
		}

		if(this.undo_manager.can_redo()){
			this.controls_redo.css("opacity", 1)
		} else {
			this.controls_redo.css("opacity", .5)
		}
	}

	get width(){
		return this.canvas_width;
	}

	get height(){
		return this.canvas_height;
	}

	get total_columns(){
		return this.columns;
	}

	get total_rows(){
		return this.rows;
	}

	get data(){
		let str_data = "";

		this.cell_info.forEach((data, key) => {
			str_data += data.replace("#", "") + ","
		});

		str_data = str_data.replace(/,$/, "");

		return str_data;
	}

	set data(data_str){
		if(!data_str || !data_str.length > 2){
			return;
		}

		this.cell_info.clear();

		let parts = data_str.split(",");

		for(let c = 0; c < this.total_columns; c ++){
			for(let r = 0; r < this.total_rows; r ++){
				let i = (c * this.total_rows) + r;
				let color = "";

				if(parts[i].length > 1){
					if(parts[i].length){
						color = "#" + parts[i];
					}

					if(!color.match(/^[#A-Za-z0-9]+$/)){
						color = "";
					}
				}

				this.cell_info.set(c + "_" + r, color);
			}
		}

		this.update_drag(true);
		this.refresh();
	}

	create_save_as_dialog(){
		if(!this.save_as_dialog){
			this.save_as_dialog = $("<div>File Name: <input type='text' id='pixel-editor-save-file-name' /></div>").dialog({

				title: "Save As...",
				resizable: false,
				draggable: false,
				modal: true,
				width: 300,
				height: 150,
				autoOpen: false,
				dialogClass: "pixel-editor-dialog",
				open: () => {
					$("#pixel-editor-save-file-name").val("").on("keyup", function(){
						if(this.value.length){
							$("#pixel-editor-save-button").button("enable").removeClass("pixel-editor-button-disabled");
						} else {
							$("#pixel-editor-save-button").button("disable").addClass("pixel-editor-button-disabled");
						}
					});
				},

				close: () => {
					$("#pixel-editor-save-button").button("disable").addClass("pixel-editor-button-disabled");
				},

				buttons: [

					{

						text: "Save",
						disabled: "disabled",
						id: "pixel-editor-save-button",
						class: "pixel-editor-button-disabled",
						click: () => {
							if($("#pixel-editor-save-file-name").val().length){
								this.file_manager.save(this.data, $("#pixel-editor-save-file-name").val(), true);
								this.controls.dialog_tweaks("option", "title", "Pixel Editor");
								this.update_drag(true);

								this.save_as_dialog.dialog("close");
								this.set_status("File saved.");
							}
						}

					}

				]

			});
		}
	}

	create_overwrite_dialog(){
		if(!this.overwrite_dialog){
			this.overwrite_dialog = $("<div>Are you sure you want to overwrite this file?</div>").dialog({

				title: "Overwriting File",
				resizable: false,
				draggable: false,
				modal: true,
				width: 330,
				height: 150,
				autoOpen: false,
				dialogClass: "pixel-editor-dialog",

				buttons: [

					{

						text: "Overwrite File",
						click: () => {
							this.file_manager.save(this.data);
							this.controls.dialog_tweaks("option", "title", "Pixel Editor");
							this.update_drag(true);
							this.overwrite_dialog.dialog("close");
							this.set_status("File saved.");
						}

					}

				]

			});
		}
	}

	save(){
		this.create_overwrite_dialog();
		this.create_save_as_dialog();

		if(this.file_manager.has_opened_file()){
			this.overwrite_dialog.dialog("open");
		} else {
			this.save_as_dialog.dialog("open");
		}
	}

	save_as(){
		this.create_save_as_dialog();
		this.save_as_dialog.dialog("open");
	}

	create_file_list_dialog(){
		if(!this.file_list_dialog){
			this.file_list_dialog = $("<div id='pixel-editor-file-list'></div>").dialog({

				title: "Open File",
				resizable: false,
				draggable: true,
				modal: true,
				width: 330,
				height: 300,
				autoOpen: false,
				dialogClass: "pixel-editor-dialog",

				open: () => {
					let list_div = $("#pixel-editor-file-list");
					let file_list = this.file_manager.get_file_list();
					let ordered_list_by_modify = [... file_list.entries()].sort((a ,b) => (a[1].modified < b[1].modified)? -1 : ((a[1].modified > b[1].modified)? 1 : 0));

					list_div.empty();

					let list_html = "";
					let bin_icon = (this.bin_16_icon)? "<img src='" + this.bin_16_icon + "' alt='Delete Art' title='Delete Art' />" : "X";

					ordered_list_by_modify.forEach(function(item){
						let created_date = Pixel_Editor_Utils.create_date_str(item[1].created);

						list_html += "<div id='" + item[0] + "' title='" + created_date + "'>" + Pixel_Editor_Utils.html_encode(item[1].file_name) + "<span>" + bin_icon + "</span></div>";
					});

					if(list_html){
						list_div.html(list_html);

						let self = this;

						list_div.find("span").on("click", function(e){
							let parent = $(this).parent();

							self.file_manager.delete(parent.attr("id"));
							self.set_status("File removed.");
							parent.remove();
							e.stopPropagation();
						});

						list_div.find("div").on("click", function(){
							let file = self.file_manager.open(this.id);

							if(file){
								self.data = file.data;
								self.undo_manager.clear();
								self.update_redo_undo_btns();
								self.controls.dialog_tweaks("option", "title", "Pixel Editor");
								self.set_status("File opened.");
							}
						});
					} else {
						list_div.html("<em>No art to open :(</em>");
					}
				}

			});
		}
	}

	open(){
		this.create_file_list_dialog();
		this.file_list_dialog.dialog("open");
	}

	update_drag(enable = false){
		if(this.controls_drag.length){
			this.controls_drag.draggable((enable)? "enable" : "disable");
		}
	}

	set_status(msg = ""){
		this.status_bar.find("span").html(msg);
	}

	get image_data(){
		return this.context.getImageData(0, 0, this.canvas_width, this.canvas_height);
	}

}