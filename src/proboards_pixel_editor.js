class ProBoards_Pixel_Editor {

	static init(){
		if(typeof yootil == "undefined"){
			return;
		}

		this.enums = {

			PLUGIN_ID: "pixeldepth_pixel_editor",
			PLUGIN_KEY: "pixeldepth_pixel_editor_post",
			PLUGIN_VERSION: "{VER}",
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

	static ready(){
		if(yootil.location.thread() || yootil.location.recent_posts()){
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

								let img_w = parseFloat(this_dialog_data.div.find("img").css("width"));
								let img_h = parseFloat(this_dialog_data.div.find("img").css("height"));

								let w = img_w - (img_w * data.s / 100);
								let h = img_h - (img_h * data.s / 100);

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
			ProBoards_Pixel_Editor.show_data_dialog(dialog_data.post_id);
		}
	}

	static show_data_dialog(id){
		if(!this.export_dialog){
			let html = "<div><textarea id='pixel-editor-export-data-area' style='width: 100%; height: 100%'></textarea></div>";

			this.export_dialog = $(html).dialog({

				title: "Pixel Art Data",
				resizable: false,
				draggable: false,
				modal: true,
				width: 500,
				height: 400,
				autoOpen: false,
				open: function(){
					let post_id = $(this).data("pixel-editor-post-id");
					let data = yootil.key.value(ProBoards_Pixel_Editor.enums.PLUGIN_KEY, post_id);

					$("#pixel-editor-export-data-area").val(data.a).select();
				}

			});
		}

		this.export_dialog.data("pixel-editor-post-id", id);
		this.export_dialog.dialog("open");
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
			html += "</div>"

			html += "<div id='pixel-editor-controls-right'>";
			html += "<ul>";
			html += "<li id='pixel-editor-color-picker' class='button' title='Pick Color' alt='Pick Color'><img src='" + this.images.color_wheel + "' /></li>";
			html += "<li id='pixel-editor-color-fill' class='button' title='Fill Color' alt='Fill Color'><img src='" + this.images.fill_color + "' /></li>";
			html += "<li id='pixel-editor-picker' class='button' title='Color Picker' alt='Color Picker'><img src='" + this.images.color_picker + "' /></li>";
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
					width: 660,
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
			html += "<div><img src='" + this.images.color_picker + "' alt='Color Picker' title='Color Picker' /> <span>Pick color from the canvas.</span></div>";
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