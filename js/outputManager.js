function OutputManager() {
  this.outputs = [
    new Output("clear", undefined),
    new Output("exit", undefined),
    new Output("help", [
      new OutputLine("<br>", 0),
      new OutputLine("Navigation commands:", 100),
      new OutputLine("  Type a command to continue the navigation.", 100),
      new OutputLine("<br>", 0),
      new OutputLine("<br>", 0),
      new OutputLine("  about     - prints a resumed version about me", 100),
      new OutputLine("  contacts  - prints all my contacts", 100),
      new OutputLine("  projects  - learn a little about my projects", 100),
      new OutputLine("<br>", 0)
    ]),
    new Output("about", [
      new OutputLine("<br>", 0),
      new OutputLine("Not too much to say", 100),
      new OutputLine("<br>", 0)
    ]),
    new Output("contacts", [
      new OutputLine("<br>", 0),
      new OutputLine("<a href='www.google.com.br'>Bisca</a>", 100),
      new OutputLine("<br>", 0)
    ]),
    new Output("projects", [
      new OutputLine("<br>", 0),
      new OutputLine("99Taxis", 100),
      new OutputLine("<br>", 0)
    ])
  ]
}

function Output(command, lines) {
  this.command = command;
  this.lines = lines;
}

function OutputLine(text, delay) {
  this.text = text;
  this.delay = delay;
}

OutputManager.prototype.getCommands = function() {
  var commands = [];
  for (var i = 0; i < this.outputs.length; i++) {
    commands.push(this.outputs[i].command);
  }

  return commands;
}
