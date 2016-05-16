"use strict";

function Terminal() {
  this.inputBuffer = ["", "", ""];
  this.lastCommand = undefined;
  this.commands = ["sobre", "help", "clear", "contact", "projects", "skills", "abacate", "abacaxi", "aba"];
  this.computer = undefined;
  this.directory = undefined;

  this.updatePrev = function() {
    $(".cursor").prev(".input").html(this.inputBuffer[0]);
  };

  this.updateNext = function() {
    $(".cursor").next(".input").html(this.inputBuffer[2]);
  };

  this.updateCenter = function() {
    if (this.inputBuffer[1]) {
      $(".cursor").html(this.inputBuffer[1]);
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
  var command = this.inputBuffer.join("");
  if (command) {
    this.fixInputAsOutput();
    this.inputWaitingResponse();

    var terminal = this;

    var objects = [
      {
        delay: 200,
        content: "Help"
      },
      {
        delay: 200,
        content: "Skills"
      },
      {
        delay: 200,
        content: "Contacts"
      }
    ]
    this.showOutput(objects);
/*
    setTimeout(function() {
      terminal.removeInput();
      terminal.clearBuffer();
      terminal.outputLine(`${command}: command not found`);
      terminal.createNewInputLine();
    }, 1000);*/
  }
};

Terminal.prototype.showOutput = function(outputArray) {
  this.removeInput();
  this.clearBuffer();

  var delay = 0;
  var terminal = this;
  for (var i = 0; i < outputArray.length; i++) {
    var obj = outputArray[i];
    delay += obj.delay;
    setTimeout(function() {
      terminal.outputLine(obj.content);
    }, delay);
  }

  setTimeout(function() {
    terminal.createNewInputLine();
  }, delay + 1);
}

Terminal.prototype.fixInputAsOutput = function() {
  $(".input").parent(".output").html($(".input").text());
}

Terminal.prototype.inputWaitingResponse = function() {
  $(".terminal").append(this.createInputLine());
}

Terminal.prototype.removeInput = function() {
  $(".input").remove();
}

Terminal.prototype.outputLine = function(content) {
  var newLine = this.createOutputLine(content);
  $(".terminal").append(newLine);
};

Terminal.prototype.createNewInputLine = function() {
  var infoText = this.createInfoLine(this.computer, this.directory);
  var newLine = this.createOutputLine(this.createInputLine(), infoText);
  $(".terminal").append(newLine);
};

Terminal.prototype.clearBuffer = function() {
  this.inputBuffer = ["","",""];
  this.updatePrev();
  this.updateCenter();
  this.updateNext();
};

Terminal.prototype.onBackPress = function() {
  if (this.inputBuffer[1] && this.inputBuffer[1].length > 1) {
    if (this.inputBuffer[2].length > 0) {
      this.inputBuffer[1] = this.inputBuffer[2].substring(0, 1);
      this.updateCenter();

      this.inputBuffer[2] = this.inputBuffer[2].substring(1);
      this.updateNext();
    } else {
      this.inputBuffer[1] = "";
      this.updateCenter();
    }
  } else if (this.inputBuffer[0]) {
    this.inputBuffer[0] = this.inputBuffer[0].substring(0,
      this.inputBuffer[0].length - 1);
    this.updatePrev()
  }
};

Terminal.prototype.onTabPress = function() {
  var currentCommand = this.inputBuffer[0];
  var foundCommands = [];
  for (var i = 0; i < this.commands.length; i++) {
    var command = this.commands[i];
    if (command.startsWith(currentCommand)) {
      foundCommands.push(command);
    }
  }

  if (foundCommands.length == 1) {
    this.inputBuffer[0] = foundCommands[0];
    this.updatePrev();
  } else if (foundCommands.length >= 2) {
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

    this.inputBuffer[0] = currentCommand;
    this.updatePrev();
  }
};

Terminal.prototype.onDeletePress = function() {
  if (this.inputBuffer[1]) {
    if (this.inputBuffer[2]) {
      this.inputBuffer[1] = this.inputBuffer[2].substring(0, 1);
      this.updateCenter();

      this.inputBuffer[2] = this.inputBuffer[2].substring(1);
      this.updateNext();
    } else {
      this.inputBuffer[1] = "";
      this.updateCenter();
    }

  }
};

Terminal.prototype.onCharTyped = function(charCode) {
  this.inputBuffer[0] += charCode;
  this.updatePrev()
};

Terminal.prototype.onLeftArrowPress = function(shiftPressed) {
  if (this.lastCommand == 39 && this.inputBuffer[1]) {
    this.inputBuffer[2] = this.inputBuffer[1] + this.inputBuffer[2];
    this.inputBuffer[1] = ""

    this.updateNext();
  }

  if (this.inputBuffer[0]) {
    var lastChar = this.inputBuffer[0].substring(
      this.inputBuffer[0].length - 1, this.inputBuffer[0].length);

    this.inputBuffer[0] = this.inputBuffer[0].substring(0,
      this.inputBuffer[0].length - 1);
    this.updatePrev();

    if (shiftPressed) {
      this.inputBuffer[1] = lastChar + this.inputBuffer[1];
      this.updateCenter();

    } else {
      this.inputBuffer[2] = this.inputBuffer[1] + this.inputBuffer[2];
      this.updateNext();

      this.inputBuffer[1] = lastChar;
      this.updateCenter();
    }
  }
};

Terminal.prototype.onRightArrowPress = function(shiftPressed) {
  if (this.lastCommand == 37 && this.inputBuffer[1]) {
    this.inputBuffer[0] += this.inputBuffer[1];
    this.inputBuffer[1] = ""

    this.updatePrev();
  }

  if (this.inputBuffer[2]) {
    var firstChar = this.inputBuffer[2].substring(0, 1);
    this.inputBuffer[2] = this.inputBuffer[2].substring(1);
    this.updateNext();

    if (shiftPressed) {
      this.inputBuffer[1] += firstChar;
      this.updateCenter();

    } else {
      this.inputBuffer[0] += this.inputBuffer[1];
      this.updatePrev();

      this.inputBuffer[1] = firstChar;
      this.updateCenter();
    }
  } else {
    this.inputBuffer[0] += this.inputBuffer[1]
    this.updatePrev();

    this.inputBuffer[1] = "";
    this.updateCenter();
  }
};
