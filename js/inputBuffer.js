function InputBuffer(terminal) {
  this.terminal = terminal;

  this.previousCommands = [];
  this.commandIndex = 0;
  this.buffer = ["", "", ""]; // 0 - Before Cursor, 1 - Cursor, 2 - After Cursor
  this.lastCommand = undefined;
}

InputBuffer.prototype.onBackPress = function() {
  if (this.buffer[1] && this.buffer[1].length > 1) {
    if (this.buffer[2].length > 0) {

      this.setBufferValue(1, this.buffer[2].substring(0, 1));
      this.setBufferValue(2, this.buffer[2].substring(1));
    } else {
      this.setBufferValue(1, "");
    }

  } else if (this.buffer[0]) {
    this.setBufferValue(0, this.buffer[0].substring(0, this.buffer[0].length - 1))
  }
};

InputBuffer.prototype.setBufferValue = function(which, value) {
  switch (which) {
    case 0:
      this.buffer[0] = value;
      this.terminal.updateBeforeCursor(value);
      break;
    case 1:
      this.buffer[1] = value;
      this.terminal.updateCursor(value);
      break;
    case 2:
      this.buffer[2] = value;
      this.terminal.updateAfterCursor(value);
      break;
  }
}

InputBuffer.prototype.onTabPress = function() {
  var commands = this.terminal.outputManager.getCommands();
  var currentCommand = this.buffer[0];
  var foundCommands = [];

  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    if (command.startsWith(currentCommand)) {
      foundCommands.push(command);
    }
  }

  if (foundCommands.length == 1) {
    this.setBufferValue(0, foundCommands[0]);
  } else if (foundCommands.length >= 2) {
    var closestCommand = this.findClosestCommand(currentCommand, foundCommands);
    this.setBufferValue(0, currentCommand);
  }
};

InputBuffer.prototype.findClosestCommand = function(currentCommand, foundCommands) {
  var stop = false;
  var i = currentCommand.length;

  while (!stop) {
    var char = undefined;

    for (var j = 0; j < foundCommands.length; j++) {
      var foundCommand = foundCommands[j];

      if (foundCommand.length > i) {
        if (char == undefined) {
          char = foundCommand.charAt(i);
        } else if (char != foundCommand.charAt(i)) {
          stop = true;
          break;
        }
      } else {
        stop = true;
        break;
      }

    }

    if (!stop) {
      currentCommand += char;
    }

    i++;
  }

  return currentCommand;
}

InputBuffer.prototype.clear = function() {
  this.buffer = ["","",""];
  this.terminal.updateBeforeCursor("");
  this.terminal.updateCursor("");
  this.terminal.updateAfterCursor("");

  console.log(this.buffer);
};

InputBuffer.prototype.onEnterPress = function() {
  var command = this.buffer.join("");
  if (command) {
    this.previousCommands.push(command);
    this.commandIndex = this.previousCommands.length;

    this.terminal.onCommandEntered(command);
  }
};

InputBuffer.prototype.onDeletePress = function() {
  if (this.buffer[1]) {
    if (this.buffer[2]) {
      this.setBufferValue(1, this.buffer[2].substring(0, 1));
      this.setBufferValue(2, this.buffer[2].substring(1));
    } else {
      this.setBufferValue(1, "");
    }
  }
};

InputBuffer.prototype.onCharTyped = function(charCode) {
  this.setBufferValue(0, this.buffer[0] + charCode);
};

InputBuffer.prototype.onLeftArrowPress = function(shiftPressed) {
  if (this.lastCommand == 39 && this.buffer[1]) {
    this.setBufferValue(2, this.buffer[1] + this.buffer[2]);
    this.setBufferValue(1, "");
  }

  if (this.buffer[0]) {
    var lastChar = this.buffer[0].substring(this.buffer[0].length - 1, this.buffer[0].length);

    this.setBufferValue(0, this.buffer[0].substring(0, this.buffer[0].length - 1));

    if (shiftPressed) {
      this.setBufferValue(1, lastChar + this.buffer[1]);

    } else {
      this.setBufferValue(2, this.buffer[1] + this.buffer[2]);
      this.setBufferValue(1, lastChar);
    }
  }
};

InputBuffer.prototype.onRightArrowPress = function(shiftPressed) {
  if (this.lastCommand == 37 && this.buffer[1]) {
    this.setBufferValue(0, this.buffer[0] + this.buffer[1]);
    this.setBufferValue(1, "");
  }

  if (this.buffer[2]) {
    var firstChar = this.buffer[2].substring(0, 1);
    this.setBufferValue(2, this.buffer[2].substring(1));

    if (shiftPressed) {
      this.setBufferValue(1, this.buffer[1] + firstChar);
    } else {
      this.setBufferValue(0, this.buffer[0] + this.buffer[1]);
      this.setBufferValue(1, firstChar);
    }
  } else {
    this.setBufferValue(0, this.buffer[0] + this.buffer[1]);
    this.setBufferValue(1, "");
  }
};


InputBuffer.prototype.onUpArrowPress = function() {
  if (this.commandIndex > 0) {
    this.commandIndex -= 1;

    var command = this.previousCommands[this.commandIndex];

    this.clear();
    this.setBufferValue(0, command);
  }
}

InputBuffer.prototype.onDownArrowPress = function() {
  if (this.commandIndex + 1 < this.previousCommands.length) {
    this.commandIndex += 1;

    var command = this.previousCommands[this.commandIndex];

    this.clear();
    this.setBufferValue(0, command);
  } else {
    this.clear();
  }
}
