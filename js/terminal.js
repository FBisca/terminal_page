"use strict";

function Terminal() {
  this.commandBuffer = ["", "", ""];
  this.lastCommand = undefined;
  this.commands = ["about", "help", "clear", "contact", "projects", "skills"];
  this.computer = undefined;
  this.directory = undefined;

  this.updatePrev = function() {
    $(".cursor").prev(".input").html(this.commandBuffer[0]);
  };

  this.updateNext = function() {
    $(".cursor").next(".input").html(this.commandBuffer[2]);
  };

  this.updateCenter = function() {
    if (this.commandBuffer[1]) {
      $(".cursor").html(this.commandBuffer[1]);
      $(".cursor").addClass("cursor-selecting");
      $(".cursor").removeClass("cursor-empty");
    } else {
      $(".cursor").html("&nbsp;");
      $(".cursor").addClass("cursor-empty");
      $(".cursor").removeClass("cursor-selecting");
    }
  };
}

Terminal.prototype.init = function(computer, directory) {
  this.computer = computer;
  this.directory = directory;

  var infoText = this.createInfoLine(computer, directory);
  var initText = this.createOutputLine(this.createInputLine(), infoText);

  $(".terminal").append(initText);

  this.startListeningForKeys();
}

Terminal.prototype.startListeningForKeys = function() {
  var terminal = this;

  $(document).keypress(function(event) {
    var consumed = terminal.onKeyPressed(event);
    if (consumed) {
      event.preventDefault();
    }

    terminal.lastCommand = event.keyCode;
  });
}

Terminal.prototype.createOutputLine = function(content, info) {
  if (info) {
    return `<li>${info}<span class="command-divisor">$</span><span class="output">${content}</span></li>`;
  } else {
    return `<li><span class="output">${content}</span></li>`;
  }
}

Terminal.prototype.createInfoLine = function(computer, directory) {
  return `<span class="secondary">${computer}</span><span class="command-divisor">:</span><span>${directory}</span>`;
}

Terminal.prototype.createInputLine = function() {
  return '<span class="input"></span><span class="input cursor cursor-empty">&nbsp;</span><span class="input"></span>';
}

Terminal.prototype.onKeyPressed = function(event) {
  switch (event.keyCode) {
    case 8: // Backspace
      this.onBackPress();
      return true;
    case 9: // Backspace
      this.onTabPress();
      return true;
    case 13: // Enter
      this.onEnterPress();
      return true;
    case 37: // Left Arrow
      this.onLeftArrowPress(event.shiftKey);
      return true;
    case 39: // Right Arrow
      this.onRightArrowPress(event.shiftKey);
      return true;
    case 46: // Delete
      this.onDeletePress();
      return true;
    default:
      if (event.charCode) {
        this.onCharTyped(String.fromCharCode(event.charCode));
        return true;
      }
  }

  return false;
};

Terminal.prototype.onEnterPress = function() {
  var command = this.commandBuffer.join("");
  if (command) {
    $(".input").parent(".output").html(command);

    this.outputLine(`${command}: command not found`);
    this.createNewInputLine();
    this.clearInput();
  }
};

Terminal.prototype.outputLine = function(content) {
  var newLine = this.createOutputLine(content);
  $(".terminal").append(newLine);
};

Terminal.prototype.createNewInputLine = function() {
  var infoText = this.createInfoLine(this.computer, this.directory);
  var newLine = this.createOutputLine(this.createInputLine(), infoText);
  $(".terminal").append(newLine);
};

Terminal.prototype.clearInput = function() {
  this.commandBuffer = ["","",""];
  this.updatePrev();
  this.updateCenter();
  this.updateNext();
};

Terminal.prototype.onBackPress = function() {
  if (this.commandBuffer[1] && this.commandBuffer[1].length > 1) {
    if (this.commandBuffer[2].length > 0) {
      this.commandBuffer[1] = this.commandBuffer[2].substring(0, 1);
      this.updateCenter();

      this.commandBuffer[2] = this.commandBuffer[2].substring(1);
      this.updateNext();
    } else {
      this.commandBuffer[1] = "";
      this.updateCenter();
    }
  } else if (this.commandBuffer[0]) {
    this.commandBuffer[0] = this.commandBuffer[0].substring(0,
      this.commandBuffer[0].length - 1);
    this.updatePrev()
  }
};

Terminal.prototype.onTabPress = function() {
  var currentCommand = this.commandBuffer[0];
  var foundCommands = [];
  for (var i = 0; i < this.commands.length; i++) {
    var command = this.commands[i];
    if (command.startsWith(currentCommand)) {
      foundCommands.push(command);
    }
  }

  if (foundCommands.length == 1) {
    this.commandBuffer[0] = foundCommands[0];
    this.updatePrev();
  } else {

  }
};

Terminal.prototype.onDeletePress = function() {
  if (this.commandBuffer[1]) {
    if (this.commandBuffer[2]) {
      this.commandBuffer[1] = this.commandBuffer[2].substring(0, 1);
      this.updateCenter();

      this.commandBuffer[2] = this.commandBuffer[2].substring(1);
      this.updateNext();
    } else {
      this.commandBuffer[1] = "";
      this.updateCenter();
    }

  }
};

Terminal.prototype.onCharTyped = function(charCode) {
  this.commandBuffer[0] += charCode;
  this.updatePrev()
};

Terminal.prototype.onLeftArrowPress = function(shiftPressed) {
  if (this.lastCommand == 39 && this.commandBuffer[1]) {
    this.commandBuffer[2] = this.commandBuffer[1] + this.commandBuffer[2];
    this.commandBuffer[1] = ""

    this.updateNext();
  }

  if (this.commandBuffer[0]) {
    var lastChar = this.commandBuffer[0].substring(
      this.commandBuffer[0].length - 1, this.commandBuffer[0].length);

    this.commandBuffer[0] = this.commandBuffer[0].substring(0,
      this.commandBuffer[0].length - 1);
    this.updatePrev();

    if (shiftPressed) {
      this.commandBuffer[1] = lastChar + this.commandBuffer[1];
      this.updateCenter();

    } else {
      this.commandBuffer[2] = this.commandBuffer[1] + this.commandBuffer[2];
      this.updateNext();

      this.commandBuffer[1] = lastChar;
      this.updateCenter();
    }
  }
};

Terminal.prototype.onRightArrowPress = function(shiftPressed) {
  if (this.lastCommand == 37 && this.commandBuffer[1]) {
    this.commandBuffer[0] += this.commandBuffer[1];
    this.commandBuffer[1] = ""

    this.updatePrev();
  }

  if (this.commandBuffer[2]) {
    var firstChar = this.commandBuffer[2].substring(0, 1);
    this.commandBuffer[2] = this.commandBuffer[2].substring(1);
    this.updateNext();

    if (shiftPressed) {
      this.commandBuffer[1] += firstChar;
      this.updateCenter();

    } else {
      this.commandBuffer[0] += this.commandBuffer[1];
      this.updatePrev();

      this.commandBuffer[1] = firstChar;
      this.updateCenter();
    }
  } else {
    this.commandBuffer[0] += this.commandBuffer[1]
    this.updatePrev();

    this.commandBuffer[1] = "";
    this.updateCenter();
  }
};
