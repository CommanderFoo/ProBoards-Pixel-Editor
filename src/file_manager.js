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