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

