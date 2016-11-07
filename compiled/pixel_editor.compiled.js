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

"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Because another lib is used on ProBoards called "Yootil" to handle
// certain things, I wrapped them in a Utils class so people can write
// their own implementations of them here instead of digging through the
// pixel editor class and changing them.

// At the time of writing this pixel editor, I am using Yootil v1
// https://github.com/PopThosePringles/ProBoards-Yootil/

var Pixel_Editor_Utils = function () {
	function _class() {
		_classCallCheck(this, _class);
	}

	_createClass(_class, null, [{
		key: "init",
		value: function init() {
			this.days = yootil.days;
			this.months = yootil.months;

			this.month = yootil.month;
			this.day = yootil.day;

			this.suffix = yootil.suffix;

			this.html_encode = yootil.html_encode;
			this.html_decode = yootil.html_decode;

			return this;
		}
	}, {
		key: "create_date_str",
		value: function create_date_str(ts) {
			var str = "";

			var date = new Date(ts);
			var day = date.getDate() || 1;
			var month = this.month(date.getMonth(), true);
			var year = date.getFullYear();
			var hours = date.getHours();
			var mins = date.getMinutes();

			mins = mins < 10 ? "0" + mins : mins;
			str = "Modified on, " + day + this.suffix(day) + " of " + month + ", " + year + ", at " + hours + ":" + mins;

			return str;
		}
	}]);

	return _class;
}().init();

$.widget("ui.dialog_tweaks", $.ui.dialog, {

	_state: {

		minimised: false,
		style: ""

	},

	_minimise_btn: null,
	_restore_btn: null,

	_create: function _create() {
		var _this = this;

		$.ui.dialog.prototype._create.call(this);

		var close = this.uiDialogTitlebarCloseText.parent();

		this._minimise_btn = $('<a href="#" class="dialog-tweaks-titlebar-controls dialog-tweaks-titlebar-minimise" role="button"><span class="ui-icon dialog-tweaks-minimise" style="background-image: url(' + this.options.icons + ')">Minimise</span></a>');

		this._restore_btn = $('<a href="#" class="dialog-tweaks-titlebar-controls dialog-tweaks-titlebar-restore" role="button"><span class="ui-icon dialog-tweaks-restore" style="background-image: url(' + this.options.icons + ')">Restore</span></a>');

		this._restore_btn.on("click", function (e) {
			_this.restore(e);

			return false;
		}).insertBefore(close);

		this._minimise_btn.on("click", function (e) {
			_this.minimise(e);

			return false;
		}).insertBefore(close);

		if (this.options.id) {
			this.uiDialog.attr("id", this.options.id);
		}
	},

	restore: function restore(event) {
		if (!this._state.minimised) {
			return;
		}

		if (this.options.before_restore) {
			this._trigger("before_restore", event);
		}

		this.uiDialog.removeClass("dialog-tweaks-minimised");
		this.uiDialog.attr("style", this._state.style);

		this.element.show();
		this.uiDialog.draggable("option", "draggable", true);

		this._minimise_btn.css("opacity", 1);
		this._restore_btn.css("opacity", .5);

		this._state.minimised = false;

		if (this.options.after_restore) {
			this._trigger("after_restore", event);
		}
	},

	minimise: function minimise(event) {
		if (this._state.minimised) {
			return;
		}

		if (this.options.before_minimise) {
			this._trigger("before_minimise", event);
		}

		this._state.style = this.uiDialog.attr("style");

		this.element.hide();

		this.uiDialog.css("top", "auto");
		this.uiDialog.css("height", "auto");
		this.uiDialog.addClass("dialog-tweaks-minimised");

		this.uiDialog.css({

			position: "fixed",
			left: this.options.offset_left ? this.options.offset_left : "100px",
			width: this.options.minimised_width ? this.options.minimised_width : "200px"

		});

		this._minimise_btn.css("opacity", .5);
		this._restore_btn.css("opacity", 1);

		this._state.minimised = true;

		if (this.options.after_minimise) {
			this._trigger("after_minimise", event);
		}
	},

	close: function close(event) {
		$.ui.dialog.prototype.close.call(this, event);

		this.uiDialog.removeClass("dialog-tweaks-minimised");

		this._minimise_btn.css("opacity", 1);
		this._restore_btn.css("opacity", .5);
	},

	open: function open(event) {
		$.ui.dialog.prototype.open.call(this, event);

		if (this._state.minimised) {
			this._state.minimised = false;
			this.minimise();
		}
	}

});

var Undo_Manager = function () {
	function Undo_Manager() {
		var limit = arguments.length <= 0 || arguments[0] === undefined ? 50 : arguments[0];

		_classCallCheck(this, Undo_Manager);

		this.stack = [];
		this.stack_limit = limit;
		this.stack_position = -1;
	}

	_createClass(Undo_Manager, [{
		key: "add",
		value: function add() {
			var cmds = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			if (cmds.undo && cmds.redo) {
				if (this.stack[this.stack_position + 1]) {
					this.stack.splice(this.stack_position + 1);
					this.stack_position = this.stack.length - 1;
				}

				this.stack.push(cmds);

				if (!this.truncate_stack()) {
					this.move_down_in_stack();
				}
			}

			return this;
		}
	}, {
		key: "move_down_in_stack",
		value: function move_down_in_stack() {
			if (this.stack_position < this.stack.length - 1) {
				this.stack_position++;
			}
		}
	}, {
		key: "move_up_in_stack",
		value: function move_up_in_stack() {
			if (this.stack_position >= -1) {
				this.stack_position--;
			}
		}
	}, {
		key: "undo",
		value: function undo() {
			if (!this.can_undo()) {
				return;
			}

			var cmds = this.stack[this.stack_position];

			if (cmds && cmds.undo) {
				this.move_up_in_stack();
				cmds.undo();
			}
		}
	}, {
		key: "truncate_stack",
		value: function truncate_stack() {
			if (this.stack.length > this.stack_limit) {
				this.stack.shift();

				return true;
			}

			return false;
		}
	}, {
		key: "redo",
		value: function redo() {
			if (!this.can_redo()) {
				return;
			}

			this.move_down_in_stack();

			var cmds = this.stack[this.stack_position];

			if (cmds && cmds.redo) {
				cmds.redo();
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			this.stack = [];
			this.stack_position = -1;
		}
	}, {
		key: "can_undo",
		value: function can_undo() {
			return this.stack_position > -1;
		}
	}, {
		key: "can_redo",
		value: function can_redo() {
			return this.stack_position < this.stack.length - 1;
		}
	}]);

	return Undo_Manager;
}();

var File_Manager = function () {
	function File_Manager() {
		_classCallCheck(this, File_Manager);

		this.opened_file = {};
	}

	_createClass(File_Manager, [{
		key: "close",
		value: function close() {
			this.opened_file = {};
		}
	}, {
		key: "has_opened_file",
		value: function has_opened_file() {
			return this.opened_file.data && this.opened_file.created && this.opened_file.key ? true : false;
		}
	}, {
		key: "get_file_list",
		value: function get_file_list() {
			var list = new Map();

			for (var key in localStorage) {
				if (localStorage.hasOwnProperty(key) && key.match(/^pixel_art_(\d+)$/)) {
					list.set(key, JSON.parse(localStorage[key]));
				}
			}

			return list;
		}
	}, {
		key: "delete",
		value: function _delete() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			if (!key) {
				return;
			}

			this.opened_file = {};
			localStorage.removeItem(key);
		}
	}, {
		key: "open",
		value: function open() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			if (!key) {
				return;
			}

			var item = localStorage.getItem(key);

			if (item) {
				this.opened_file = JSON.parse(item);

				return JSON.parse(item);
			}

			return false;
		}
	}, {
		key: "save",
		value: function save() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var file_name = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

			if (!data) {
				return;
			}

			var created = +new Date();
			var key = "pixel_art_" + created;
			var file_data = {

				key: key,
				created: created,
				modified: created,
				file_name: file_name,
				data: data

			};

			if (!file_name && this.has_opened_file()) {
				file_data.created = this.opened_file.created;
				file_data.key = this.opened_file.key;
				file_data.file_name = this.opened_file.file_name;
			}

			file_data.file_name = this.create_file_name(file_data.file_name.toString());

			if (!file_data.file_name) {
				file_data.file_name = "My Awesome Pixel Art";
			}

			this.opened_file = file_data;

			localStorage.setItem(file_data.key, JSON.stringify(file_data));

			return true;
		}
	}, {
		key: "create_file_name",
		value: function create_file_name() {
			var file_name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			return file_name.substr(0, 40);
		}
	}]);

	return File_Manager;
}();

var Pixel_Editor = function () {
	function Pixel_Editor() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref$bin = _ref.bin;
		var bin = _ref$bin === undefined ? "" : _ref$bin;

		_classCallCheck(this, Pixel_Editor);

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

	_createClass(Pixel_Editor, [{
		key: "init",
		value: function init() {
			var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var _ref2$canvas_selector = _ref2.canvas_selector;
			var canvas_selector = _ref2$canvas_selector === undefined ? "#pixel-editor-canvas" : _ref2$canvas_selector;
			var _ref2$controls_select = _ref2.controls_selector;
			var controls_selector = _ref2$controls_select === undefined ? "#pixel-editor-canvas-controls" : _ref2$controls_select;

			this.canvas = $(canvas_selector).get(0);

			if (!this.canvas || !this.canvas.getContext("2d")) {
				console.warn("Pixel Editor: No canvas object / context");

				return;
			}

			this.controls = $(controls_selector);

			if (!this.controls.length) {
				console.warn("Pixel Editor: No controls element");

				return;
			}

			this.canvas_width = this.canvas.width;
			this.canvas_height = this.canvas.height;
			this.context = this.canvas.getContext("2d");

			this.context.globalAlpha = 1;

			this.columns = ~~(this.canvas_width / this.cell_size);
			this.rows = ~~(this.canvas_height / this.cell_size);

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
	}, {
		key: "init_map",
		value: function init_map() {
			for (var h = 0; h < this.columns; h++) {
				for (var v = 0; v < this.rows; v++) {
					this.cell_info.set(h + "_" + v, "");
				}
			}
		}
	}, {
		key: "create_controls",
		value: function create_controls() {
			var _this2 = this;

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

			this.controls_mirror.on("click", function () {
				if (_this2.is_mirroring) {
					_this2.controls_mirror.attr("title", "Mirror");
					_this2.controls_mirror.removeClass("pixel-editor-active-control");
					_this2.is_mirroring = false;
					_this2.set_status("Mirroring turned off.");
				} else {
					_this2.controls_mirror.attr("title", "Turn Off Mirror");
					_this2.controls_mirror.addClass("pixel-editor-active-control");
					_this2.is_mirroring = true;
					_this2.set_status("Mirroring turned on.");
				}
			});

			this.controls_export.on("click", function () {
				if (!_this2.export_dialog) {
					_this2.create_export_dialog();
				} else {
					_this2.export_dialog.dialog("open");
				}
			});

			this.controls_import.on("click", function () {
				if (!_this2.import_dialog) {
					_this2.create_import_dialog();
				} else {
					_this2.import_dialog.dialog("open");
				}
			});

			this.controls_color.on("click", function (obj) {
				if (_this2.is_erasing_color) {
					_this2.controls_erase_color.trigger("click");
				}
			});

			this.controls_grid.on("click", function () {
				if (_this2.grid_on) {
					_this2.controls_grid.attr("title", "Show Grid");
					_this2.controls_grid.removeClass("pixel-editor-active-control");
					_this2.remove_grid();
					_this2.set_status("Grid turned off.");
				} else {
					_this2.controls_grid.attr("title", "Hide Grid");
					_this2.controls_grid.addClass("pixel-editor-active-control");
					_this2.show_grid();
					_this2.set_status("Grid turned on.");
				}
			});

			this.controls_clear.on("click", function () {
				_this2.cell_info.clear();
				_this2.init_map();
				_this2.clear();
				_this2.show_grid();
				_this2.undo_manager.clear();
				_this2.update_redo_undo_btns();
				_this2.file_manager.close();
				_this2.controls.dialog_tweaks("option", "title", "Pixel Editor");
				_this2.update_drag(false);

				if (_this2.is_erasing_color) {
					_this2.controls_erase_color.trigger("click");
				}

				if (_this2.is_filling) {
					_this2.controls_fill_color.trigger("click");
				}

				_this2.set_status("Canvas has been cleared, you can't undo this action.");
			});

			this.controls_fill_color.on("click", function () {
				if (_this2.is_filling) {
					_this2.is_filling = false;
					_this2.controls_fill_color.removeClass("pixel-editor-active-control");
					_this2.set_status("Fill color turned off.");

					return;
				}

				_this2.controls_fill_color.addClass("pixel-editor-active-control");
				_this2.is_filling = true;

				var color = "transparent";

				if (_this2.selected_color != "") {
					color = "<span style='color: " + _this2.selected_color + "'>" + _this2.selected_color + "</span>";
				}

				_this2.set_status("Fill color turned on using color \"" + color + "\".  <strong>Warning: </strong> You can't undo this action.");
			});

			this.controls_erase_color.on("click", function () {
				if (_this2.is_erasing_color) {
					_this2.is_erasing_color = false;
					_this2.controls_erase_color.removeClass("pixel-editor-active-control");
					_this2.set_status("Eraser turned off.");

					return;
				}

				_this2.controls_erase_color.addClass("pixel-editor-active-control");
				_this2.is_erasing_color = true;
				_this2.set_status("Eraser turned on.");
			});

			this.controls_undo.on("click", function () {
				_this2.undo_manager.undo();
				_this2.update_drag(false);
				_this2.controls.dialog_tweaks("option", "title", "*Pixel Editor");
				_this2.update_redo_undo_btns();
			});

			this.controls_redo.on("click", function () {
				_this2.undo_manager.redo();
				_this2.update_drag(false);
				_this2.update_redo_undo_btns();
			});
		}
	}, {
		key: "create_export_dialog",
		value: function create_export_dialog() {
			var _this3 = this;

			var html = "<div><textarea id='pixel-editor-export-data-area' style='width: 100%; height: 100%'></textarea></div>";

			this.export_dialog = $(html).dialog({

				title: "Exporting Data",
				resizable: false,
				draggable: false,
				modal: true,
				width: 500,
				height: 400,
				dialogClass: "pixel-editor-dialog",
				open: function open() {
					$("#pixel-editor-export-data-area").val(_this3.data).select();
				}

			});
		}
	}, {
		key: "create_import_dialog",
		value: function create_import_dialog() {
			var _this4 = this;

			var html = "<div><textarea id='pixel-editor-import-data-area' style='width: 100%; height: 100%'></textarea></div>";

			this.import_dialog = $(html).dialog({

				title: "Importing Data",
				resizable: false,
				draggable: false,
				modal: true,
				width: 500,
				height: 400,
				dialogClass: "pixel-editor-dialog",
				open: function open() {
					$("#pixel-editor-import-data-area").val("");
				},

				buttons: {

					"Import Data": function ImportData() {
						_this4.data = $("#pixel-editor-import-data-area").val();
						_this4.import_dialog.dialog("close");
						_this4.controls.dialog_tweaks("option", "title", "*Pixel Editor");
					}

				}

			});
		}
	}, {
		key: "get_mouse_pos",
		value: function get_mouse_pos(e) {
			var rect = this.canvas.getBoundingClientRect();

			return {

				x: e.clientX - rect.left,
				y: e.clientY - rect.top

			};
		}
	}, {
		key: "add_events",
		value: function add_events() {
			var _this5 = this;

			$(this.canvas).on("click", function (e) {
				if (_this5.is_filling) {
					_this5.fill_canvas();
					return;
				}

				var m_pos = _this5.get_mouse_pos(e);
				var mouse_x = m_pos.x;
				var mouse_y = m_pos.y;

				console.log(m_pos);

				var cell_x = ~~(mouse_x / _this5.cell_size);
				var cell_y = ~~(mouse_y / _this5.cell_size);

				if (cell_x < 0 || cell_x >= _this5.canvas_width || cell_y < 0 || cell_y >= _this5.canvas_height) {
					return;
				}

				_this5.update_drag(false);
				_this5.controls.dialog_tweaks("option", "title", "*Pixel Editor");

				var current_data = _this5.cell_info.get(cell_x + "_" + cell_y);
				var new_data = _this5.is_erasing_color ? "" : _this5.selected_color;
				var current_mirror_data = "";
				var mirror_x = "";

				_this5.cell_info.set(cell_x + "_" + cell_y, new_data);

				if (_this5.is_mirroring) {
					if (cell_x < _this5.total_columns / 2) {
						mirror_x = _this5.total_columns - 1 - cell_x;
						current_mirror_data = _this5.cell_info.get(mirror_x + "_" + cell_y);

						_this5.cell_info.set(mirror_x + "_" + cell_y, new_data);
						_this5.fill(new_data, mirror_x, cell_y);
					}
				}

				_this5.undo_manager.add({

					undo: function undo() {
						_this5.cell_info.set(cell_x + "_" + cell_y, current_data);
						_this5.fill(current_data, cell_x, cell_y);

						if (mirror_x) {
							_this5.cell_info.set(mirror_x + "_" + cell_y, current_mirror_data);
							_this5.fill(current_mirror_data, mirror_x, cell_y);
						}
					},

					redo: function redo() {
						_this5.cell_info.set(cell_x + "_" + cell_y, new_data);
						_this5.fill(new_data, cell_x, cell_y);

						if (mirror_x) {
							_this5.cell_info.set(mirror_x + "_" + cell_y, new_data);
							_this5.fill(new_data, mirror_x, cell_y);
						}
					}

				});

				_this5.fill(new_data, cell_x, cell_y);
				_this5.update_redo_undo_btns();
			});
		}
	}, {
		key: "fill_canvas",
		value: function fill_canvas() {
			this.update_drag(false);

			for (var c = 0; c < this.columns; c++) {
				for (var r = 0; r < this.rows; r++) {
					this.cell_info.set(c + "_" + r, this.selected_color);
					this.fill(this.selected_color, c, r);
				}
			}

			this.controls.dialog_tweaks("option", "title", "*Pixel Editor");

			var color = "transparent";

			if (this.selected_color != "") {
				color = "<span style='color: " + this.selected_color + "'>" + this.selected_color + "</span>";
			}

			this.set_status("Canvas filled using color \"" + color + "\".");
		}
	}, {
		key: "fill",
		value: function fill() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var grid_x = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
			var grid_y = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

			if (grid_x > -1 && grid_y > -1) {
				if (!data) {
					this.context.clearRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
				} else {
					this.context.fillStyle = data;
					this.context.fillRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
				}
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
			this.context.fillStyle = "transparent";
			this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
		}
	}, {
		key: "remove_grid",
		value: function remove_grid() {
			this.grid_on = false;
			this.svg_grid.hide();
		}
	}, {
		key: "create_art",
		value: function create_art() {
			var _this6 = this;

			this.cell_info.forEach(function (data, key) {
				var _key$split = key.split("_");

				var _key$split2 = _slicedToArray(_key$split, 2);

				var x = _key$split2[0];
				var y = _key$split2[1];


				_this6.fill(data, x, y);
			});
		}
	}, {
		key: "refresh",
		value: function refresh() {
			this.clear();
			this.create_art();
		}
	}, {
		key: "show_grid",
		value: function show_grid() {
			this.grid_on = true;
			this.svg_grid.show();
		}
	}, {
		key: "update_redo_undo_btns",
		value: function update_redo_undo_btns() {
			if (this.undo_manager.can_undo()) {
				this.controls_undo.css("opacity", 1);
			} else {
				this.controls_undo.css("opacity", .5);
			}

			if (this.undo_manager.can_redo()) {
				this.controls_redo.css("opacity", 1);
			} else {
				this.controls_redo.css("opacity", .5);
			}
		}
	}, {
		key: "create_save_as_dialog",
		value: function create_save_as_dialog() {
			var _this7 = this;

			if (!this.save_as_dialog) {
				this.save_as_dialog = $("<div>File Name: <input type='text' id='pixel-editor-save-file-name' /></div>").dialog({

					title: "Save As...",
					resizable: false,
					draggable: false,
					modal: true,
					width: 300,
					height: 150,
					autoOpen: false,
					dialogClass: "pixel-editor-dialog",
					open: function open() {
						$("#pixel-editor-save-file-name").val("").on("keyup", function () {
							if (this.value.length) {
								$("#pixel-editor-save-button").button("enable").removeClass("pixel-editor-button-disabled");
							} else {
								$("#pixel-editor-save-button").button("disable").addClass("pixel-editor-button-disabled");
							}
						});
					},

					close: function close() {
						$("#pixel-editor-save-button").button("disable").addClass("pixel-editor-button-disabled");
					},

					buttons: [{

						text: "Save",
						disabled: "disabled",
						id: "pixel-editor-save-button",
						class: "pixel-editor-button-disabled",
						click: function click() {
							if ($("#pixel-editor-save-file-name").val().length) {
								_this7.file_manager.save(_this7.data, $("#pixel-editor-save-file-name").val(), true);
								_this7.controls.dialog_tweaks("option", "title", "Pixel Editor");
								_this7.update_drag(true);

								_this7.save_as_dialog.dialog("close");
								_this7.set_status("File saved.");
							}
						}

					}]

				});
			}
		}
	}, {
		key: "create_overwrite_dialog",
		value: function create_overwrite_dialog() {
			var _this8 = this;

			if (!this.overwrite_dialog) {
				this.overwrite_dialog = $("<div>Are you sure you want to overwrite this file?</div>").dialog({

					title: "Overwriting File",
					resizable: false,
					draggable: false,
					modal: true,
					width: 330,
					height: 150,
					autoOpen: false,
					dialogClass: "pixel-editor-dialog",

					buttons: [{

						text: "Overwrite File",
						click: function click() {
							_this8.file_manager.save(_this8.data);
							_this8.controls.dialog_tweaks("option", "title", "Pixel Editor");
							_this8.update_drag(true);
							_this8.overwrite_dialog.dialog("close");
							_this8.set_status("File saved.");
						}

					}]

				});
			}
		}
	}, {
		key: "save",
		value: function save() {
			this.create_overwrite_dialog();
			this.create_save_as_dialog();

			if (this.file_manager.has_opened_file()) {
				this.overwrite_dialog.dialog("open");
			} else {
				this.save_as_dialog.dialog("open");
			}
		}
	}, {
		key: "save_as",
		value: function save_as() {
			this.create_save_as_dialog();
			this.save_as_dialog.dialog("open");
		}
	}, {
		key: "create_file_list_dialog",
		value: function create_file_list_dialog() {
			var _this9 = this;

			if (!this.file_list_dialog) {
				this.file_list_dialog = $("<div id='pixel-editor-file-list'></div>").dialog({

					title: "Open File",
					resizable: false,
					draggable: true,
					modal: true,
					width: 330,
					height: 300,
					autoOpen: false,
					dialogClass: "pixel-editor-dialog",

					open: function open() {
						var list_div = $("#pixel-editor-file-list");
						var file_list = _this9.file_manager.get_file_list();
						var ordered_list_by_modify = [].concat(_toConsumableArray(file_list.entries())).sort(function (a, b) {
							return a[1].modified < b[1].modified ? -1 : a[1].modified > b[1].modified ? 1 : 0;
						});

						list_div.empty();

						var list_html = "";
						var bin_icon = _this9.bin_16_icon ? "<img src='" + _this9.bin_16_icon + "' alt='Delete Art' title='Delete Art' />" : "X";

						ordered_list_by_modify.forEach(function (item) {
							var created_date = Pixel_Editor_Utils.create_date_str(item[1].created);

							list_html += "<div id='" + item[0] + "' title='" + created_date + "'>" + Pixel_Editor_Utils.html_encode(item[1].file_name) + "<span>" + bin_icon + "</span></div>";
						});

						if (list_html) {
							(function () {
								list_div.html(list_html);

								var self = _this9;

								list_div.find("span").on("click", function (e) {
									var parent = $(this).parent();

									self.file_manager.delete(parent.attr("id"));
									self.set_status("File removed.");
									parent.remove();
									e.stopPropagation();
								});

								list_div.find("div").on("click", function () {
									var file = self.file_manager.open(this.id);

									if (file) {
										self.data = file.data;
										self.undo_manager.clear();
										self.update_redo_undo_btns();
										self.controls.dialog_tweaks("option", "title", "Pixel Editor");
										self.set_status("File opened.");
									}
								});
							})();
						} else {
							list_div.html("<em>No art to open :(</em>");
						}
					}

				});
			}
		}
	}, {
		key: "open",
		value: function open() {
			this.create_file_list_dialog();
			this.file_list_dialog.dialog("open");
		}
	}, {
		key: "update_drag",
		value: function update_drag() {
			var enable = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

			if (this.controls_drag.length) {
				this.controls_drag.draggable(enable ? "enable" : "disable");
			}
		}
	}, {
		key: "set_status",
		value: function set_status() {
			var msg = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			this.status_bar.find("span").html(msg);
		}
	}, {
		key: "width",
		get: function get() {
			return this.canvas_width;
		}
	}, {
		key: "height",
		get: function get() {
			return this.canvas_height;
		}
	}, {
		key: "total_columns",
		get: function get() {
			return this.columns;
		}
	}, {
		key: "total_rows",
		get: function get() {
			return this.rows;
		}
	}, {
		key: "data",
		get: function get() {
			var str_data = "";

			this.cell_info.forEach(function (data, key) {
				str_data += data.replace("#", "") + ",";
			});

			str_data = str_data.replace(/,$/, "");

			return str_data;
		},
		set: function set(data_str) {
			if (!data_str || !data_str.length > 2) {
				return;
			}

			this.cell_info.clear();

			var parts = data_str.split(",");

			for (var c = 0; c < this.total_columns; c++) {
				for (var r = 0; r < this.total_rows; r++) {
					var i = c * this.total_rows + r;
					var color = "";

					if (parts[i].length > 1) {
						if (parts[i].length) {
							color = "#" + parts[i];
						}

						if (!color.match(/^[#A-Za-z0-9]+$/)) {
							color = "";
						}
					}

					this.cell_info.set(c + "_" + r, color);
				}
			}

			this.update_drag(true);
			this.refresh();
		}
	}, {
		key: "image_data",
		get: function get() {
			return this.context.getImageData(0, 0, this.canvas_width, this.canvas_height);
		}
	}]);

	return Pixel_Editor;
}();

var Pixel_Images = function () {
	function Pixel_Images() {
		_classCallCheck(this, Pixel_Images);

		this.lookup = new Map();
		this.cell_size = 20;

		this.canvas_prep = $("<canvas width='580' height='380'></canvas>").get(0);
		this.context = this.canvas_prep.getContext("2d");
		this.canvas_width = this.canvas_prep.width;
		this.canvas_height = this.canvas_prep.height;

		this.columns = ~~(this.canvas_prep.width / this.cell_size);
		this.rows = ~~(this.canvas_prep.height / this.cell_size);
	}

	_createClass(Pixel_Images, [{
		key: "create",
		value: function create() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var $content = arguments[1];
			var post_id = arguments[2];

			if ($content.length != 1) {
				return;
			}

			if (data) {
				if (data.a && data.a.length > 2) {
					var img = new Image();

					if (!this.lookup.has(data.k)) {
						this.clear();

						var parts = data.a.split(",");
						var highest_trans_pixel = -1;
						var lowest_trans_pixel = -1;

						for (var c = 0; c < this.columns; c++) {
							for (var r = 0; r < this.rows; r++) {
								var i = c * this.rows + r;
								var color = "";

								if (parts[i].length > 1) {
									if (parts[i].length) {
										color = "#" + parts[i];
									}

									if (!color.match(/^[#A-Za-z0-9]+$/)) {
										color = "";
									}
								}

								this.fill(color, c, r);
							}
						}

						this.trim();

						var base64 = this.canvas_prep.toDataURL();

						img.src = base64;

						this.lookup.set(data.k, img);
					} else {
						img = this.lookup.get(data.k);
					}

					var style = "";

					if (data.s) {
						var w = this.canvas_width - this.canvas_width * data.s / 100;
						var h = this.canvas_height - this.canvas_height * data.s / 100;

						style = " style='width: " + w + "px; height: " + h + "px;'";
					}

					var div = $("<div><img" + style + " src='" + img.src + "' /></div>").addClass("pixel-editor-user-art").attr("data-pixel-editor-post-id", parseInt(post_id, 10));

					div.find("img").attr("data-pixel-editor-key", yootil.html_encode(data.k));
					div.insertAfter($content.find("article"));
				}
			}
		}
	}, {
		key: "clear",
		value: function clear() {
			this.canvas_prep.width = this.canvas_width;
			this.canvas_prep.height = this.canvas_height;
			this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
			this.context.fillStyle = "transparent";
			this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
		}
	}, {
		key: "fill",
		value: function fill() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var grid_x = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
			var grid_y = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

			if (grid_x > -1 && grid_y > -1) {
				if (!data) {
					this.context.clearRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
				} else {
					this.context.fillStyle = data;
					this.context.fillRect(parseFloat(grid_x) * this.cell_size, parseFloat(grid_y) * this.cell_size, this.cell_size, this.cell_size);
				}
			}
		}
	}, {
		key: "trim",
		value: function trim() {
			var image_data = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
			var canvas_context = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			var width = this.canvas_width;
			var height = this.canvas_height;
			var ctx = canvas_context ? canvas_context : this.context;
			var data = image_data ? image_data.data : this.context.getImageData(0, 0, width, height).data;

			var min_x = -1;
			var max_x = -1;
			var min_y = -1;
			var max_y = -1;

			// Credit to potomek, http://stackoverflow.com/a/22267731/5941389 for the base algorithm
			// Difference here is the sort can be dropped for a bit of efficiency, and fixed
			// 1px cropping issue for width and height by adding them back

			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {

					// Data contains rgba, so every 4 is a color

					var i = (y * width + x) * 4;

					// Check if alpha is not transparent

					if (data[i + 3] > 0) {
						min_x = min_x > -1 ? min_x : x;
						min_y = min_y > -1 ? min_y : y;

						max_x = Math.max(max_x, x);
						max_y = Math.max(max_y, y);
					}
				}
			}

			// Put cutout image onto canvas

			var img = ctx.getImageData(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1);

			// Resize canvas to new size

			this.canvas_prep.width = max_x - min_x + 1;
			this.canvas_prep.height = max_y - min_y + 1;

			this.context.putImageData(img, 0, 0);

			if (data) {
				return this.canvas_prep.toDataURL();
			}
		}
	}]);

	return Pixel_Images;
}();

var ProBoards_Pixel_Editor = function () {
	function ProBoards_Pixel_Editor() {
		_classCallCheck(this, ProBoards_Pixel_Editor);
	}

	_createClass(ProBoards_Pixel_Editor, null, [{
		key: "init",
		value: function init() {
			if (typeof yootil == "undefined") {
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
			this.options_dialog = null;
			this.export_dialog = null;

			this.setup();
			this.create_icon_and_dialog();

			$(this.ready.bind(this));
			yootil.event.after_search(this.ready.bind(this));

			return this;
		}
	}, {
		key: "ready",
		value: function ready() {
			var _this10 = this;

			if (yootil.location.thread() || yootil.location.recent_posts()) {
				(function () {
					_this10.pixel_images = new Pixel_Images();

					var self = _this10;

					$("tr.post").each(function () {
						var post_id = parseInt($(this).attr("id").split("-")[1], 10);
						var $mini_profile = $(this).find(".mini-profile:first");
						var $user_link = $mini_profile.find("a.user-link[href*='user/']");
						var key_data = yootil.key.value(self.enums.PLUGIN_KEY, post_id);
						var $content = $(this).find(".content");

						if (key_data) {
							self.pixel_images.create(key_data, $content, post_id);
						}

						if ($user_link.length) {
							var user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

							if (!user_id_match || !parseInt(user_id_match[1], 10)) {
								console.warn("Pixel Editor: Could not match user link.");
								return;
							}

							var user_id = parseInt(user_id_match[1], 10);

							if (yootil.user.id() == user_id || yootil.user.is_staff()) {
								$content.droppable({

									accept: "#pixel-editor-drag-to",
									tolerance: "touch",
									drop: function drop(event, ui) {
										var $existing = $content.find("div.pixel-editor-user-art");

										if ($existing.length) {
											$existing.remove();
										}

										var key = pixel_editor.file_manager.opened_file.created + "_" + yootil.user.id();
										var trimed_data = self.pixel_images.trim(self.pixel_editor.image_data, self.pixel_editor.context);
										var art = $("<div><img src='" + yootil.html_encode(trimed_data) + "' /></div>");

										art.find("img").attr("data-pixel-editor-key", yootil.html_encode(key)).on("dblclick", self.show_dblclick_dialog);

										if (self.settings.default_scale > 0) {
											var w = 580 - 580 * self.settings.default_scale / 100;
											var h = 380 - 380 * self.settings.default_scale / 100;

											art.find("img").css({

												width: w + "px",
												height: h + "px"

											});
										}

										art.addClass("pixel-editor-user-art").attr("data-pixel-editor-post-id", parseInt(post_id, 10)).insertAfter($content.find("article"));

										var data = {

											a: pixel_editor.file_manager.opened_file.data,
											s: self.settings.default_scale,
											k: key

										};

										yootil.key.set(self.enums.PLUGIN_KEY, data, post_id, {

											success: function success() {
												pixel_editor.set_status("Successfully dropped art onto post.");
											},

											error: function error(_error) {
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

					$("div.pixel-editor-user-art img").on("dblclick", _this10.show_dblclick_dialog);
				})();
			}
		}
	}, {
		key: "show_dblclick_dialog",
		value: function show_dblclick_dialog() {
			var dialog_data = {};

			dialog_data.div = $(this).parent();
			dialog_data.post_id = parseInt(dialog_data.div.attr("data-pixel-editor-post-id"), 10);
			dialog_data.key = $(this).attr("data-pixel-editor-key");
			dialog_data.user_id = parseInt(dialog_data.key.split("_")[1], 10);

			if (yootil.user.is_staff() || yootil.user.id() == dialog_data.user_id) {
				if (!ProBoards_Pixel_Editor.options_dialog) {
					ProBoards_Pixel_Editor.options_dialog = $("<div>Scale Percentage: <input type='text' name='scale' id='pixel-editor-art-scale' /></div>").dialog({

						draggable: true,
						modal: true,
						resizable: false,
						width: 340,
						height: 180,
						title: "Pixel Art - Options",
						autoOpen: false,

						open: function open() {
							var this_dialog_data = $(this).data("pixel-editor-image-dialog-data");
							var data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, this_dialog_data.post_id);

							if (data.s) {
								$("#pixel-editor-art-scale").val(parseFloat(data.s));
							}
						},

						buttons: [{

							text: "Close",
							click: function click() {
								$(this).dialog("close");
							}

						}, {

							text: "Save Size",
							click: function click() {
								var this_dialog_data = $(this).data("pixel-editor-image-dialog-data");
								var data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, this_dialog_data.post_id);
								var scale = parseFloat($("#pixel-editor-art-scale").val());

								scale = scale < 0 || scale > 100 ? 0 : scale;
								data.s = scale;

								yootil.key.set(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, data, this_dialog_data.post_id);

								var img_w = parseFloat(this_dialog_data.div.find("img").css("width"));
								var img_h = parseFloat(this_dialog_data.div.find("img").css("height"));

								var w = img_w - img_w * data.s / 100;
								var h = img_h - img_h * data.s / 100;

								this_dialog_data.div.find("img").css({

									width: w + "px",
									height: h + "px"

								});

								$(this).dialog("close");
							}

						}, {

							text: "Get Data",
							click: function click() {
								var this_dialog_data = $(this).data("pixel-editor-image-dialog-data");

								ProBoards_Pixel_Editor.show_data_dialog(this_dialog_data.post_id);
								$(this).dialog("close");
							}

						}, {

							text: "Delete Art",
							click: function click() {
								var this_dialog_data = $(this).data("pixel-editor-image-dialog-data");

								yootil.key.set(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, "", this_dialog_data.post_id);
								this_dialog_data.div.remove();
								$(this).dialog("close");
							}

						}]

					});
				}

				ProBoards_Pixel_Editor.options_dialog.data("pixel-editor-image-dialog-data", dialog_data);
				ProBoards_Pixel_Editor.options_dialog.dialog("open");
			} else {
				ProBoards_Pixel_Editor.show_data_dialog(dialog_data.post_id);
			}
		}
	}, {
		key: "show_data_dialog",
		value: function show_data_dialog(id) {
			if (!this.export_dialog) {
				var html = "<div><textarea id='pixel-editor-export-data-area' style='width: 100%; height: 100%'></textarea></div>";

				this.export_dialog = $(html).dialog({

					title: "Pixel Art Data",
					resizable: false,
					draggable: false,
					modal: true,
					width: 500,
					height: 400,
					autoOpen: false,
					open: function open() {
						var post_id = $(this).data("pixel-editor-post-id");
						var data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, post_id);

						$("#pixel-editor-export-data-area").val(data.a).select();
					}

				});
			}

			this.export_dialog.data("pixel-editor-post-id", id);
			this.export_dialog.dialog("open");
		}
	}, {
		key: "create_icon_and_dialog",
		value: function create_icon_and_dialog() {
			var _this11 = this;

			if (this.images.draw_16) {
				(function () {
					window.pixel_editor = _this11.pixel_editor = new Pixel_Editor({

						bin: _this11.images.bin_16

					});

					var html = "";

					html += "<div id='pixel-editor-canvas-controls'>";
					html += "<div id='pixel-editor-controls-top' class='ui-helper-clearfix'>";
					html += "<ul>";
					html += "<li id='pixel-editor-undo' class='button' title='Undo' alt='Undo'><img src='" + _this11.images.undo + "' /></li>";
					html += "<li id='pixel-editor-redo' class='button' title='Redo' alt='Redo'><img src='" + _this11.images.redo + "' /></li>";
					html += "</ul>";
					html += "<ul>";
					html += "<li id='pixel-editor-open' class='button' title='Open' alt='Open'><img src='" + _this11.images.open + "' /></li>";
					html += "<li id='pixel-editor-save' class='button' title='Save' alt='Save'><img src='" + _this11.images.save + "' /></li>";
					html += "<li id='pixel-editor-save-as' class='button' title='Save As...' alt='Save As...'><img src='" + _this11.images.save_as + "' /></li>";
					html += "</ul>";
					html += "<ul>";
					html += "<li id='pixel-editor-import' class='button' title='Import Raw Data' alt='Import Raw Data'><img src='" + _this11.images.import + "' /></li>";
					html += "<li id='pixel-editor-export' class='button' title='Export Raw Data' alt='Export Raw Data'><img src='" + _this11.images.export + "' /></li>";

					if (!yootil.user.logged_in()) {
						html += "<li style='opacity: 0.5' class='button' title='Please login to use this feature' alt='Please login to use this feature'><img src='" + _this11.images.picture_drag + "' /></li>";
					} else {
						html += "<li id='pixel-editor-drag-to' class='button' title='Drag & Drop On To Post' alt='Drag & Drop On To Post'><img src='" + _this11.images.picture_drag + "' /></li>";
					}

					html += "</ul>";
					html += "<ul>";
					html += "<li id='pixel-editor-clear' class='button' title='Clear' alt='Clear'><img src='" + _this11.images.bin + "' /></li>";
					html += "</ul>";
					html += "<ul>";
					html += "<li id='pixel-editor-help' class='button' title='Help' alt='Help'><img src='" + _this11.images.help + "' /></li>";
					html += "</ul>";
					html += "</div>";
					html += "<canvas draggable='false' id='pixel-editor-canvas' width='580' height='380'></canvas>";

					html += "<div id='pixel-editor-grid-svg'>";
					html += "<svg draggable='false' width='581' height='381' xmlns='http://www.w3.org/2000/svg'>";
					html += "<defs>";
					html += "<pattern id='smallGrid' patternUnits='userSpaceOnUse' width='20' height='20'>";
					html += "<path fill='none' stroke='gray' stroke-width='1' d='M 20 0 L 0 0 0 20'></path>";
					html += "</pattern>";
					html += "</defs>";
					html += "<rect width='100%' height='100%' fill='url(#smallGrid)'></rect>";
					html += "</svg>";
					html += "</div>";

					html += "<div id='pixel-editor-controls-right'>";
					html += "<ul>";
					html += "<li id='pixel-editor-color-picker' class='button' title='Pick Color' alt='Pick Color'><img src='" + _this11.images.color_wheel + "' /></li>";
					html += "<li id='pixel-editor-color-fill' class='button' title='Fill Color' alt='Fill Color'><img src='" + _this11.images.fill_color + "' /></li>";
					html += "<li id='pixel-editor-erase' class='button' title='Erase Color' alt='Erase Color'><img src='" + _this11.images.eraser + "' /></li>";
					html += "<li id='pixel-editor-grid' class='button pixel-editor-active-control' title='Hide Grid' alt='Hide Grid'><img src='" + _this11.images.grid + "' /></li>";
					html += "<li id='pixel-editor-mirror' class='button' title='Mirror' alt='Mirror'><img src='" + _this11.images.mirror + "' /></li>";
					html += "</ul>";
					html += "</div>";
					html += "<br style='clear: both' /><div id='pixel-editor-status-info'><img src='" + _this11.images.information + "' title='Info' alt='Info' /> <span>---</span></div>";
					html += "</div>";

					html = $(html);

					var self = _this11;

					html.find("#pixel-editor-color-picker").colorPicker({

						hex: "000000",
						allowTransparent: true,
						autoOpen: false,
						autoUpdate: false,
						update: function update(value) {
							var status = "Color selected: ";

							if (value == "transparent") {
								self.pixel_editor.selected_color = "";
								status += "transparent";
							} else {
								self.pixel_editor.selected_color = "#" + value;
								status += "<span style='color: #" + value + "'>#" + value + "</span>.";
							}

							self.pixel_editor.set_status(status);
							$(this).colorPicker("hide");
						}

					}).on("click", function () {
						$(this).colorPicker("open");
					});

					html.find("#pixel-editor-help").on("click", _this11.open_help.bind(_this11));

					html.find("#pixel-editor-drag-to").draggable({

						appendTo: "body",
						zIndex: 1500,
						cursor: "move",
						disabled: true,
						helper: function helper() {
							return $("<img src='" + _this11.images.picture + "' />");
						}

					});

					yootil.bar.add("#", _this11.images.draw_16, "Pixel Editor", "pixel-editor-main-dialog", function () {
						html.dialog_tweaks({

							title: "Pixel Editor",
							modal: false,
							height: 490,
							width: 660,
							resizable: false,
							draggable: true,
							icons: _this11.images.ui_icons,
							id: "pixel-editor-main-dialog",
							minimised_width: "230px",
							left_offset: "250px",
							dialogClass: "pixel-editor-dialog",

							create: function create() {
								return _this11.pixel_editor.init();
							}

						});

						return false;
					});
				})();
			}
		}
	}, {
		key: "open_help",
		value: function open_help() {
			if (!this.help_dialog) {
				var html = "";

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
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.enums.PLUGIN_ID);

			if (plugin && plugin.settings) {
				var settings = plugin.settings;

				if (plugin.images) {
					this.images = plugin.images;
				}
			}
		}
	}]);

	return ProBoards_Pixel_Editor;
}();

ProBoards_Pixel_Editor.init();