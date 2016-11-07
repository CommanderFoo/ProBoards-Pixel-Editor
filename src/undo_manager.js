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