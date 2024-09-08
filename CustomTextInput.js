/*:
 * @target MZ
 * @plugindesc Adds a custom text input feature to RPG Maker MZ.
 * @help This plugin allows players to input custom text during the game.
 *
 * @author Joy
 * @param TextInputVariableId
 * @text Text Input Variable ID
 * @type variable
 * @desc The variable ID to store the input text.
 * @default 1
 *
 * @command CustomTextInput
 * @text Custom Text Input
 * @desc Prompts the player to input text and stores it in a variable.
 *
 * @arg prompt
 * @text Prompt
 * @desc The text to show as the prompt for the text input.
 * @default Please enter your text:
 */

(() => {
    const pluginName = 'CustomTextInput';
    const parameters = PluginManager.parameters(pluginName);
    const textInputVariableId = Number(parameters['TextInputVariableId'] || 1);

    PluginManager.registerCommand(pluginName, "CustomTextInput", args => {
        const prompt = args.prompt || "Please enter your text:";
        const variableId = textInputVariableId;
        SceneManager.push(Scene_CustomTextInput);
        SceneManager.prepareNextScene(prompt, variableId);
    });

    function Scene_CustomTextInput() {
        this.initialize(...arguments);
    }

    Scene_CustomTextInput.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CustomTextInput.prototype.constructor = Scene_CustomTextInput;

    Scene_CustomTextInput.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_CustomTextInput.prototype.prepare = function(prompt, variableId) {
        this._prompt = prompt;
        this._variableId = variableId;
    };

    Scene_CustomTextInput.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createPromptWindow();
        this.createInputWindow();
    };

    Scene_CustomTextInput.prototype.createPromptWindow = function() {
        const rect = this.promptWindowRect();
        this._promptWindow = new Window_Base(rect);
        this._promptWindow.drawTextEx(this._prompt, 0, 0);
        this.addWindow(this._promptWindow);
    };

    Scene_CustomTextInput.prototype.createInputWindow = function() {
        const rect = this.inputWindowRect();
        this._inputWindow = new Window_CustomTextInput(rect);
        this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
        this._inputWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._inputWindow);
        this._inputWindow.activate();
    };

    Scene_CustomTextInput.prototype.promptWindowRect = function() {
        const wx = 0;
        const wy = 0;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(1, false);
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_CustomTextInput.prototype.inputWindowRect = function() {
        const wx = 0;
        const wy = this._promptWindow.height;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(2, true);
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_CustomTextInput.prototype.onInputOk = function() {
        const inputText = this._inputWindow.inputText();
        $gameVariables.setValue(this._variableId, inputText);
        this.popScene();
    };

    function Window_CustomTextInput() {
        this.initialize(...arguments);
    }

    Window_CustomTextInput.prototype = Object.create(Window_Selectable.prototype);
    Window_CustomTextInput.prototype.constructor = Window_CustomTextInput;

    Window_CustomTextInput.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._editText = '';
        this.refresh();
        this.activate();
        this._windowInputListener = this.onInput.bind(this);
        window.addEventListener('keydown', this._windowInputListener);
    };

    Window_CustomTextInput.prototype.maxItems = function() {
        return 1;
    };

    Window_CustomTextInput.prototype.refresh = function() {
        this.contents.clear();
        this.drawText(this._editText, 0, 0, this.contentsWidth(), 'left');
    };

    Window_CustomTextInput.prototype.inputText = function() {
        return this._editText;
    };

    Window_CustomTextInput.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
    };

    Window_CustomTextInput.prototype.onInput = function(event) {
        if (event.key === "Backspace") { // Backspace
            this._editText = this._editText.slice(0, -1);
        } else if (event.key === "Escape") { // Escape
            this.processCancel();
        } else if (event.key === "Space") { // Space
            this._editText += " ";
        } else if (event.key.length === 1) { // Other characters
            this._editText += event.key;
        }
        this.refresh();
    };

    Window_CustomTextInput.prototype.processOk = function() {
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    };

    Window_CustomTextInput.prototype.processCancel = function() {
        this.updateInputData();
        this.deactivate();
        this.callCancelHandler();
    };

    Window_CustomTextInput.prototype.terminate = function() {
        Window_Selectable.prototype.terminate.call(this);
        window.removeEventListener('keydown', this._windowInputListener);
    };

})();
