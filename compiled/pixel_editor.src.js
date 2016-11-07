/**
* @license
* ProBoards Pixel Editor 1.0.0
* The MIT License (MIT)
*
* Copyright (c) 2016 pixeldepth.net - http://support.proboards.com/user/2671
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

// Because another lib is used on ProBoards called "Yootil" to handle
// certain things, I wrapped them in a Utils class so people can write
// their own implementations of them here instead of digging through the
// pixel editor class and changing them.

// At the time of writing this pixel editor, I am using Yootil v1
// https://github.com/PopThosePringles/ProBoards-Yootil/

let Pixel_Editor_Utils = (class {

	static init(){
		this.days = yootil.days;
		this.months = yootil.months;

		this.month = yootil.month;
		this.day = yootil.day;

		this.suffix = yootil.suffix;

		this.html_encode = yootil.html_encode;
		this.html_decode = yootil.html_decode;

		return this;
	}

	static create_date_str(ts){
		let str = "";

		let date = new Date(ts);
		let day = date.getDate() || 1;
		let month = this.month(date.getMonth(), true);
		let year = date.getFullYear();
		let hours = date.getHours();
		let mins = date.getMinutes();

		mins = (mins < 10)? "0" + mins : mins;
		str = "Modified on, " + day + this.suffix(day) + " of " + month + ", " + year + ", at " + hours + ":" + mins;

		return str;
	}

}).init();

$.widget("ui.dialog_tweaks", $.ui.dialog, {

	_state: {

		minimised: false,
		style: ""

	},

	_minimise_btn: null,
	_restore_btn: null,

	_create: function(){
		$.ui.dialog.prototype._create.call(this);

		let close = this.uiDialogTitlebarCloseText.parent();

		this._minimise_btn = $('<a href="#" class="dialog-tweaks-titlebar-controls dialog-tweaks-titlebar-minimise" role="button"><span class="ui-icon dialog-tweaks-minimise" style="background-image: url(' + this.options.icons + ')">Minimise</span></a>');

		this._restore_btn = $('<a href="#" class="dialog-tweaks-titlebar-controls dialog-tweaks-titlebar-restore" role="button"><span class="ui-icon dialog-tweaks-restore" style="background-image: url(' + this.options.icons + ')">Restore</span></a>');

		this._restore_btn.on("click", (e) => {
			this.restore(e);

			return false;
		}).insertBefore(close);

		this._minimise_btn.on("click", (e) => {
			this.minimise(e);

			return false;
		}).insertBefore(close);

		if(this.options.id){
			this.uiDialog.attr("id", this.options.id);
		}
	},

	restore: function(event){
		if(!this._state.minimised){
			return;
		}

		if(this.options.before_restore){
			this._trigger("before_restore", event);
		}

		this.uiDialog.removeClass("dialog-tweaks-minimised");
		this.uiDialog.attr("style", this._state.style);

		this.element.show();
		this.uiDialog.draggable("option", "draggable", true);

		this._minimise_btn.css("opacity", 1);
		this._restore_btn.css("opacity", .5);

		this._state.minimised = false;

		if(this.options.after_restore){
			this._trigger("after_restore", event);
		}
	},

	minimise: function(event){
		if(this._state.minimised){
			return;
		}

		if(this.options.before_minimise){
			this._trigger("before_minimise", event);
		}

		this._state.style = this.uiDialog.attr("style");

		this.element.hide();

		this.uiDialog.css("top", "auto");
		this.uiDialog.css("height", "auto");
		this.uiDialog.addClass("dialog-tweaks-minimised");

		this.uiDialog.css({

			position: "fixed",
			left: (this.options.offset_left)? this.options.offset_left : "100px",
			width: (this.options.minimised_width)? this.options.minimised_width : "200px"

		});

		this._minimise_btn.css("opacity", .5);
		this._restore_btn.css("opacity", 1);

		this._state.minimised = true;

		if(this.options.after_minimise){
			this._trigger("after_minimise", event);
		}
	},

	close: function(event){
		$.ui.dialog.prototype.close.call(this, event);

		this.uiDialog.removeClass("dialog-tweaks-minimised");

		this._minimise_btn.css("opacity", 1);
		this._restore_btn.css("opacity", .5);
	},

	open: function(event){
		$.ui.dialog.prototype.open.call(this, event);

		if(this._state.minimised){
			this._state.minimised = false;
			this.minimise();
		}
	}

});



class Undo_Manager {

	constructor(limit = 50){
		this.stack = [];
		this.stack_limit = limit;
		this.stack_position = -1;
	}

	add(cmds = {}){
		if(cmds.undo && cmds.redo){
			if(this.stack[this.stack_position + 1]){
				this.stack.splice(this.stack_position + 1);
				this.stack_position = this.stack.length - 1;
			}

			this.stack.push(cmds);

			if(!this.truncate_stack()){
				this.move_down_in_stack();
			}
		}

		return this;
	}

	move_down_in_stack(){
		if(this.stack_position < (this.stack.length - 1)){
			this.stack_position ++;
		}
	}

	move_up_in_stack(){
		if(this.stack_position >= -1){
			this.stack_position --;
		}
	}

	undo(){
		if(!this.can_undo()){
			return;
		}

		let cmds = this.stack[this.stack_position];

		if(cmds && cmds.undo){
			this.move_up_in_stack();
			cmds.undo();
		}
	}

	truncate_stack(){
		if(this.stack.length > this.stack_limit){
			this.stack.shift();

			return true;
		}

		return false;
	}

	redo(){
		if(!this.can_redo()){
			return;
		}

		this.move_down_in_stack();

		let cmds = this.stack[this.stack_position];

		if(cmds && cmds.redo){
			cmds.redo();
		}
	}

	clear(){
		this.stack = [];
		this.stack_position = -1;
	}

	can_undo(){
		return this.stack_position > -1;
	}

	can_redo(){
		return this.stack_position < (this.stack.length - 1);
	}

}

class Storage_Manager {

}

class File_Manager {

	constructor(){
		this.opened_file = {};
	}

	close(){
		this.opened_file = {};
	}

	has_opened_file(){
		return (this.opened_file.data && this.opened_file.created && this.opened_file.key)? true : false;
	}

	get_file_list(){
		let list = new Map();

		for(let key in localStorage){
			if(localStorage.hasOwnProperty(key) && key.match(/^pixel_art_(\d+)$/)){
				list.set(key, JSON.parse(localStorage[key]));
			}
		}

		return list;
	}

	delete(key = ""){
		if(!key){
			return;
		}

		this.opened_file = {};
		localStorage.removeItem(key);
	}

	open(key = ""){
		if(!key){
			return;
		}

		let item = localStorage.getItem(key);

		if(item){
			this.opened_file = JSON.parse(item);

			return JSON.parse(item);
		}

		return false;
	}

	save(data = "", file_name = ""){
		if(!data){
			return;
		}

		let created = + new Date();
		let key = "pixel_art_" + created;
		let file_data = {

			key,
			created,
			modified: created,
			file_name,
			data

		};

		if(!file_name && this.has_opened_file()){
			file_data.created = this.opened_file.created;
			file_data.key = this.opened_file.key;
			file_data.file_name = this.opened_file.file_name;
		}

		file_data.file_name = this.create_file_name(file_data.file_name.toString());

		if(!file_data.file_name){
			file_data.file_name = "My Awesome Pixel Art";
		}

		this.opened_file = file_data;

		localStorage.setItem(file_data.key, JSON.stringify(file_data));

		return true;
	}

	create_file_name(file_name = ""){
		return file_name.substr(0, 40);
	}

}

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
		this.canvas_prep.style.width = this.canvas_width + "px";
		this.canvas_prep.style.height = this.canvas_height + "px";
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
					min_x = (min_x > -1)? min_x : x;
					min_y = (min_y > -1)? min_y : y;

					max_x = Math.max(max_x, x);
					max_y = Math.max(max_y, y);
				}
			}
		}

		// Put cutout image onto canvas

		let img = ctx.getImageData(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1);

		// Resize canvas to new size

		this.canvas_prep.width = max_x - min_x + 1;
		this.canvas_prep.height = max_y - min_y + 1;

		this.context.putImageData(img, 0, 0);

		if(data){
			return this.canvas_prep.toDataURL();
		}
	}

}

class ProBoards_Pixel_Editor {

	static init(){
		if(typeof yootil == "undefined"){
			return;
		}

		this.enums = {

			PLUGIN_ID: "pixeldepth_pixel_editor",
			PLUGIN_KEY: "pixeldepth_pixel_editor_post",
			PLUGIN_VERSION: "1.0.0",
			PLUGIN_CALLED: yootil.ts()

		};

		Object.freeze(this.enums);

		this.settings = {

			default_scale: 0

		};

		this.images = {};
		this.help_dialog = null;
		this.options_dialog = null

		this.setup();
		this.create_icon_and_dialog();

		$(this.ready.bind(this));
		yootil.event.after_search(this.ready.bind(this));

		return this;
	}

	static ready(){
		if(yootil.location.thread()){
			this.pixel_images = new Pixel_Images();

			let self = this;

			$("tr.post").each(function(){
				let post_id = parseInt($(this).attr("id").split("-")[1], 10);
				let $mini_profile = $(this).find(".mini-profile:first");
				let $user_link = $mini_profile.find("a.user-link[href*='user/']");
				let key_data = yootil.key.value(self.enums.PLUGIN_KEY, post_id);
				let $content = $(this).find(".content");

				if(key_data){
					self.pixel_images.create(key_data, $content, post_id);
				}

				if($user_link.length){
					let user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

					if(!user_id_match || !parseInt(user_id_match[1], 10)){
						console.warn("Pixel Editor: Could not match user link.");
						return;
					}

					let user_id = parseInt(user_id_match[1], 10);

					if(yootil.user.id() == user_id || yootil.user.is_staff()){
						$content.droppable({

							accept: "#pixel-editor-drag-to",
							tolerance: "touch",
							drop(event, ui){
								let $existing = $content.find("div.pixel-editor-user-art");

								if($existing.length){
									$existing.remove();
								}

								let key = pixel_editor.file_manager.opened_file.created + "_" + yootil.user.id();
								let trimed_data = self.pixel_images.trim(self.pixel_editor.image_data, self.pixel_editor.context);
								let art = $("<div><img src='" + yootil.html_encode(trimed_data) + "' /></div>");

								art.find("img").attr("data-pixel-editor-key", yootil.html_encode(key)).on("dblclick", self.show_dblclick_dialog);

								if(self.settings.default_scale > 0){
									let w = 580 - (580 * self.settings.default_scale / 100);
									let h = 380 - (380 * self.settings.default_scale / 100);

									art.find("img").css({

										width: w + "px",
										height: h + "px"

									});
								}

								art.addClass("pixel-editor-user-art").attr("data-pixel-editor-post-id", parseInt(post_id, 10)).insertAfter($content.find("article"));

								let data = {

									a: pixel_editor.file_manager.opened_file.data,
									s: self.settings.default_scale,
									k: key

								};

								yootil.key.set(self.enums.PLUGIN_KEY, data, post_id, {

									success: () => {
										pixel_editor.set_status("Successfully dropped art onto post.");
									},

									error(error){
										pixel_editor.set_status("Could not drop art onto post.");
									}

								});

							}

						});
					}
				} else {
					console.warn("Pixel Editor: Could not find user link.");
					return;
				}
			});

			$("div.pixel-editor-user-art img").on("dblclick", this.show_dblclick_dialog);
		}
	}

	static show_dblclick_dialog(){
		let dialog_data = {}

		dialog_data.div = $(this).parent();
		dialog_data.post_id = parseInt(dialog_data.div.attr("data-pixel-editor-post-id"), 10);
		dialog_data.key = $(this).attr("data-pixel-editor-key");
		dialog_data.user_id = parseInt(dialog_data.key.split("_")[1], 10);

		if(yootil.user.is_staff() || yootil.user.id() == dialog_data.user_id){
			if(!ProBoards_Pixel_Editor.options_dialog){
				ProBoards_Pixel_Editor.options_dialog = $("<div>Scale Percentage: <input type='text' name='scale' id='pixel-editor-art-scale' /></div>").dialog({

					draggable: true,
					modal: true,
					resizable: false,
					width: 340,
					height: 180,
					title: "Pixel Art - Options",
					autoOpen: false,

					open: function(){
						let this_dialog_data = $(this).data("pixel-editor-image-dialog-data");
						let data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, this_dialog_data.post_id);

						if(data.s){
							$("#pixel-editor-art-scale").val(parseFloat(data.s));
						}
					},

					buttons: [

						{

							text: "Close",
							click: function(){
								$(this).dialog("close");
							}

						},

						{

							text: "Save Size",
							click: function(){
								let this_dialog_data = $(this).data("pixel-editor-image-dialog-data");
								let data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, this_dialog_data.post_id);
								let scale = parseFloat($("#pixel-editor-art-scale").val());

								scale = (scale < 0 || scale > 100)? 0 : scale;
								data.s = scale;

								yootil.key.set(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, data, this_dialog_data.post_id);

								let w = 580 - (580 * data.s / 100);
								let h = 380 - (380 * data.s / 100);

								this_dialog_data.div.find("img").css({

									width: w + "px",
									height: h + "px"

								})

								$(this).dialog("close");
							}

						},

						{

							text: "Get Data",
							click: function(){
								let this_dialog_data = $(this).data("pixel-editor-image-dialog-data");

								ProBoards_Pixel_Editor.show_data_dialog(this_dialog_data.post_id);
								$(this).dialog("close");
							}

						},

						{

							text: "Delete Art",
							click: function(){
								let this_dialog_data = $(this).data("pixel-editor-image-dialog-data");

								yootil.key.set(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, "", this_dialog_data.post_id);
								this_dialog_data.div.remove();
								$(this).dialog("close");
							}

						}

					]

				});
			}

			ProBoards_Pixel_Editor.options_dialog.data("pixel-editor-image-dialog-data", dialog_data);
			ProBoards_Pixel_Editor.options_dialog.dialog("open");
		} else {
			//ProBoards_Pixel_Editor.show_data_dialog(diapost_id);
		}
	}

	static show_data_dialog(post_id){
		console.log("show data dialog");
	}

	static create_icon_and_dialog(){
		if(this.images.draw_16){
			window.pixel_editor = this.pixel_editor = new Pixel_Editor({

				bin: this.images.bin_16

			});

			let html = "";

			html += "<div id='pixel-editor-canvas-controls'>";
			html += "<div id='pixel-editor-controls-top' class='ui-helper-clearfix'>";
			html += "<ul>";
			html += "<li id='pixel-editor-undo' class='button' title='Undo' alt='Undo'><img src='" + this.images.undo + "' /></li>";
			html += "<li id='pixel-editor-redo' class='button' title='Redo' alt='Redo'><img src='" + this.images.redo + "' /></li>";
			html += "</ul>";
			html += "<ul>";
			html += "<li id='pixel-editor-open' class='button' title='Open' alt='Open'><img src='" + this.images.open + "' /></li>";
			html += "<li id='pixel-editor-save' class='button' title='Save' alt='Save'><img src='" + this.images.save + "' /></li>";
			html += "<li id='pixel-editor-save-as' class='button' title='Save As...' alt='Save As...'><img src='" + this.images.save_as + "' /></li>";
			html += "</ul>";
			html += "<ul>";
			html += "<li id='pixel-editor-import' class='button' title='Import Raw Data' alt='Import Raw Data'><img src='" + this.images.import + "' /></li>";
			html += "<li id='pixel-editor-export' class='button' title='Export Raw Data' alt='Export Raw Data'><img src='" + this.images.export + "' /></li>";

			if(!yootil.user.logged_in()){
				html += "<li style='opacity: 0.5' class='button' title='Please login to use this feature' alt='Please login to use this feature'><img src='" + this.images.picture_drag + "' /></li>";
			} else {
				html += "<li id='pixel-editor-drag-to' class='button' title='Drag & Drop On To Post' alt='Drag & Drop On To Post'><img src='" + this.images.picture_drag + "' /></li>";
			}

			html += "</ul>";
			html += "<ul>";
			html += "<li id='pixel-editor-clear' class='button' title='Clear' alt='Clear'><img src='" + this.images.bin + "' /></li>";
			html += "</ul>";
			html += "<ul>";
			html += "<li id='pixel-editor-help' class='button' title='Help' alt='Help'><img src='" + this.images.help + "' /></li>";
			html += "</ul>";
			html += "</div>";
			html += "<canvas id='pixel-editor-canvas' width='580' height='380' draggable='true'></canvas>";

			html += "<div id='pixel-editor-grid-svg'>";
			html += "<svg width='581' height='381' xmlns='http://www.w3.org/2000/svg'>";
			html += "<defs>";
			html += "<pattern id='smallGrid' patternUnits='userSpaceOnUse' width='20' height='20'>";
			html += "<path fill='none' stroke='gray' stroke-width='1' d='M 20 0 L 0 0 0 20'></path>";
			html += "</pattern>";
			html += "</defs>";
			html += "<rect width='100%' height='100%' fill='url(#smallGrid)'></rect>";
			html += "</svg>";
			html += "</div>"

			html += "<div id='pixel-editor-controls-right'>";
			html += "<ul>";
			html += "<li id='pixel-editor-color-picker' class='button' title='Pick Color' alt='Pick Color'><img src='" + this.images.color_wheel + "' /></li>";
			html += "<li id='pixel-editor-color-fill' class='button' title='Fill Color' alt='Fill Color'><img src='" + this.images.fill_color + "' /></li>";
			html += "<li id='pixel-editor-erase' class='button' title='Erase Color' alt='Erase Color'><img src='" + this.images.eraser + "' /></li>";
			html += "<li id='pixel-editor-grid' class='button pixel-editor-active-control' title='Hide Grid' alt='Hide Grid'><img src='" + this.images.grid + "' /></li>";
			html += "<li id='pixel-editor-mirror' class='button' title='Mirror' alt='Mirror'><img src='" + this.images.mirror + "' /></li>";
			html += "</ul>";
			html += "</div>";
			html += "<br style='clear: both' /><div id='pixel-editor-status-info'><img src='" + this.images.information + "' title='Info' alt='Info' /> <span>---</span></div>";
			html += "</div>";

			html = $(html);

			let self = this;

			html.find("#pixel-editor-color-picker").colorPicker({

				hex: "000000",
				allowTransparent: true,
				autoOpen: false,
				autoUpdate: false,
				update: function(value){
					let status = "Color selected: ";

					if(value == "transparent"){
						self.pixel_editor.selected_color = "";
						status += "transparent";
					} else {
						self.pixel_editor.selected_color = "#" + value;
						status += "<span style='color: #" + value + "'>#" + value + "</span>.";
					}

					self.pixel_editor.set_status(status);
					$(this).colorPicker("hide");
				}

			}).on("click", function(){
				$(this).colorPicker("open");
			});

			html.find("#pixel-editor-help").on("click", this.open_help.bind(this));

			html.find("#pixel-editor-drag-to").draggable({

				appendTo: "body",
				zIndex: 1500,
				cursor: "move",
				disabled: true,
				helper: () => {
					return $("<img src='" + this.images.picture + "' />");
				}

			});

			yootil.bar.add("#", this.images.draw_16, "Pixel Editor", "pixel-editor-main-dialog", () => {
				html.dialog_tweaks({

					title: "Pixel Editor",
					modal: false,
					height: 490,
					width: 650,
					resizable: false,
					draggable: true,
					icons: this.images.ui_icons,
					id: "pixel-editor-main-dialog",
					minimised_width: "230px",
					left_offset: "250px",
					dialogClass: "pixel-editor-dialog",

					create: () => this.pixel_editor.init()

				});

				return false;
			});
		}
	}

	static open_help(){
		if(!this.help_dialog){
			let html = "";

			html += "<div id='pixel-editor-help'>";
			html += "<div><img src='" + this.images.undo + "' alt='Undo' title='Undo' /> <span>Undo last action.</span></div>";
			html += "<div><img src='" + this.images.redo + "' alt='Redo' title='Redo' /> <span>Redo last action.</span></div>";
			html += "<br />";
			html += "<div><img src='" + this.images.open + "' alt='Open' title='Open' /> <span>Open file list of saved pixel art.</span></div>";
			html += "<div><img src='" + this.images.save + "' alt='Save' title='Save' /> <span>Save current pixel art.</span></div>";
			html += "<div><img src='" + this.images.save_as + "' alt='Save As...' title='Save AS...' /> <span>Save current pixel art as a new file.</span></div>";
			html += "<br />";
			html += "<div><img src='" + this.images.import + "' alt='Import Raw Data' title='Import Raw Data' /> <span>Import raw pixel art data.</span></div>";
			html += "<div><img src='" + this.images.export + "' alt='Export Raw Data' title='Export Raw Data' /> <span>Export raw pixel art data.</span></div>";
			html += "<div><img src='" + this.images.picture_drag + "' alt='Drag & Drop On To Post' title='Drag & Drop On To Post' /> <span>Drag & drop onto post to attach art (must be saved).</span></div>";
			html += "<br />";
			html += "<div><img src='" + this.images.bin + "' alt='Clear' title='Clear' /> <span>Clear canvas and all saved actions.</span></div>";
			html += "<br />";
			html += "<div><img src='" + this.images.color_wheel + "' alt='Color' title='Color' /> <span>Select color to use.</span></div>";
			html += "<div><img src='" + this.images.fill_color + "' alt='Fill Color' title='Fill Color' /> <span>Fill all pixels with selected color.</span></div>";
			html += "<div><img src='" + this.images.eraser + "' alt='Erase Color' title='Erase Color' /> <span>Erases color.</span></div>";
			html += "<div><img src='" + this.images.grid + "' alt='Hide / Show Grid' title='Hide / Show Grid' /> <span>Hide / Show grid while creating art.</span></div>";
			html += "<div><img src='" + this.images.mirror + "' alt='Mirror' title='Mirror' /> <span>Mirror changes on the right.</span></div>";
			html += "</div>";

			this.help_dialog = $(html).dialog({

				title: "Pixel Editor - Help",
				modal: false,
				height: 400,
				width: 460,
				resizable: false,
				draggable: true,
				autoOpen: false,
				dialogClass: "pixel-editor-dialog"

			});
		}

		this.help_dialog.dialog("open");
	}

	static setup(){
		let plugin = pb.plugin.get(this.enums.PLUGIN_ID);

		if(plugin && plugin.settings){
			let settings = plugin.settings;

			if(plugin.images){
				this.images = plugin.images;
			}
		}
	}

}

ProBoards_Pixel_Editor.init();