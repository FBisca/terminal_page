"use strict";

function Terminal() {
  this.inputBuffer = new InputBuffer(this);
  this.outputManager = new OutputManager();
  this.computer = undefined;
  this.directory = undefined;
}

Terminal.prototype.init = function(computer, directory) {
  this.computer = computer;
  this.directory = directory;

  var info = this.createInfoText(computer, directory);
  var inputLine = this.createInputLine(info);

  this.appendTerminal(inputLine);

  this.startListeningForKeys();
}

Terminal.prototype.startListeningForKeys = function() {
  var terminal = this;

  $(document).keypress(function(event) {
    var consumed = terminal.onKeyPressed(event);
    if (consumed) {
      event.preventDefault();
    }

    terminal.inputBuffer.lastCommand = event.keyCode;
  });
}

Terminal.prototype.createOutputLine = function(content, info) {
  if (info) {
    return `<li>${info}<span class="command-divisor command-margin">$</span><span class="output">${content}</span></li>`;
  } else {
    return `<li><span class="output">${content}</span></li>`;
  }
}

Terminal.prototype.createInputLine = function(info) {
  $(".input").remove();

  var inputLine = '<span class="input"></span><span class="input cursor cursor-empty">&nbsp;</span><span class="input"></span>';
  if (info) {
    return `<li>${info}<span class="command-divisor command-margin">$</span>${inputLine}</li>`;
  } else {
    return `<li>${inputLine}</li>`;
  }
}

Terminal.prototype.createInfoText = function(computer, directory) {
  return `<span class="secondary">${computer}</span><span class="command-divisor">:</span><span>${directory}</span>`;
}

Terminal.prototype.appendTerminal = function(text) {
  $(".terminal").append(text);
  window.scrollTo(0, document.body.scrollHeight);
}

Terminal.prototype.log = function(text) {
  var output = this.createOutputLine(text);
  this.appendTerminal(output);
}

Terminal.prototype.fixInput = function() {
  var content = `<span class="output">${$(".input").text()}</span>`;

  $(".input").parent("li").append(content);
  $(".input").remove();
}


Terminal.prototype.updateBeforeCursor = function(value) {
  $(".cursor").prev(".input").html(value);
};

Terminal.prototype.updateAfterCursor = function(value) {
  $(".cursor").next(".input").html(value);
};

Terminal.prototype.updateCursor = function(value) {
  if (value) {
    $(".cursor").addClass("cursor-selecting").removeClass("cursor-empty").html(value);
  } else {
    $(".cursor").addClass("cursor-empty").removeClass("cursor-selecting").html("&nbsp;");
  }
};

Terminal.prototype.onKeyPressed = function(event) {
  switch (event.keyCode) {
    case 8: // Backspace
      this.inputBuffer.onBackPress();
      return true;
    case 9: // Backspace
      this.inputBuffer.onTabPress();
      return true;
    case 13: // Enter
      this.inputBuffer.onEnterPress();
      return true;
    case 37: // Left Arrow
      this.inputBuffer.onLeftArrowPress(event.shiftKey);
      return true;
    case 38: // Up Arrow
      this.inputBuffer.onUpArrowPress();
      return true;
    case 39: // Right Arrow
      this.inputBuffer.onRightArrowPress(event.shiftKey);
      return true;
    case 40: // Down Arrow
      this.inputBuffer.onDownArrowPress();
      return true;
    case 46: // Delete
      this.inputBuffer.onDeletePress();
      return true;
    default:
      if (!event.ctrlKey) {
        if (event.charCode) {
          this.inputBuffer.onCharTyped(String.fromCharCode(event.charCode));
          return true;
        }
      }
  }

  return false;
};

Terminal.prototype.onCommandEntered = function(command) {
  var outputs = this.outputManager.outputs;
  if (this.isPredefined(command)) {
    return;
  }

  for (var i = 0; i < outputs.length; i++) {
    if (outputs[i].command == command) {
        this.onCommandFound(outputs[i]);
        return;
    }
  }
  this.onCommandNotFound(command);
}

Terminal.prototype.onCommandFound = function(output) {
  this.printOutputDelayed(0, output.lines);
}

Terminal.prototype.printOutputDelayed = function(index, lines) {
  if (index >= lines.length) {
    var info = this.createInfoText(this.computer, this.directory);
    this.appendTerminal(this.createInputLine(info));
    return;
  } else if (index == 0) {
    this.fixInput();
    this.inputBuffer.clear();
  }
  var line = lines[index];
  this.log(line.text);

  var terminal = this;
  setTimeout(function() {
    terminal.printOutputDelayed(index + 1, lines);
  }, line.delay);
}

Terminal.prototype.onCommandNotFound = function(command) {
  this.fixInput();
  this.appendTerminal(this.createInputLine());

  var terminal = this;
  var inputBuffer = this.inputBuffer;
  setTimeout(function() {

    inputBuffer.clear();
    terminal.log(`${command}: command not found`);

    var info = terminal.createInfoText(terminal.computer, terminal.directory);
    terminal.appendTerminal(terminal.createInputLine(info));
  }, 600);
}

Terminal.prototype.isPredefined = function(command) {
  switch (command) {
    case "clear":
      this.clear();
      return true;
  }

  return false;
}

Terminal.prototype.clear = function() {
  $(".terminal").empty();
  var info = this.createInfoText(this.computer, this.directory);
  this.appendTerminal(this.createInputLine(info));
}
