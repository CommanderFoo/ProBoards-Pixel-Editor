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