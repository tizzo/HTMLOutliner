/**
 * @file
 *   This jQuery plugin provides a pluggable system for manipulating HTML outlines.
 */
(function($){  
  $.fn.HTMLOutline = function() {  

    var activeItem = undefined;

    var modifierKeyIsDown = false;

    /**
     * Create our abstract (as far as js will allow) item handler.
     *
     * All elements in an outline are treated equally (each should be a list element which may or may not contain other list elements)
     */
    var item = function() {}

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    item.moveUp = function(current) {
      current.prev().before(current);
    }

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    item.moveDown = function(current) {
      current.next().after(current);
    }

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    item.makeChild = function(current) {
      previous = current.prev();
      previous.html(previous.html() + liify(current));
    }

    var liify = function(thing) {
      thing.wrap('li').wrap('ul');
      return thing.parent().parent();
    }

    // Whether keybaord listening is currently active.
    var keyboardListening = false;

    var eventResponder = function() {}

    /**
     * The function serves as an event dispatcher which calls the appropriate callbacks
     */
    var keyboardResponder = function(event) {
      if (keyboardListening) {
        if (modifierKeyIsDown) {
          switch (event.keyCode) {
            case options.keyCodes.moveDown:
              event.preventDefault();
              item.moveDown(activeItem);
              break;
            case options.keyCodes.moveUp:
              event.preventDefault();
              item.moveUp(activeItem);
              break;
            case options.keyCodes.makeChild:
              event.preventDefault();
              item.makeChild(activeItem);
              break;
            case options.keyCodes.makeSibling:
              event.preventDefault();
              break;
          }
        }
        else {
          switch (event.keyCode) {
            case options.keyCodes.newElement:
              event.preventDefault();
              break;
            case options.keyCodes.quit:
              event.preventDefault();
              uninitialize();
              break;
          }
        }
      }
    }

    var startKeyboardListeners = function(outline) {
      keyboardListening = true;
    }

    var stopKeyboardListeners = function() {
      keyboardListening = false;
    }

    var formify = function(text) {
      // TODO: Add plugable callback
      return getForm(text);
    }

    var deformify = function(current) {
      return $('#HTMLOutliner-active', activeItem).val();
    }

    var getForm = function(text) {
      form = '<form><input type="text" id="HTMLOutliner-active" name="HTMLOutliner" value="' + text + '"></form>'
      return form;
    }

    var intialize = function(outline) {
      // Activate keyboard listening.
      startKeyboardListeners();
      // Set the first element in the outline to the active element.
      activeItem = outline.children().first();
      activeItem.addClass(options.activeClass);
      activeItem.html(getForm(activeItem.html()));
    }

    var uninitialize = function(outline) {
      stopKeyboardListeners();
      activeItem.removeClass(options.activeClass);
      activeItem.html(deformify(activeItem));
      activeItem = undefined;
    }

    /**
     * Populate our defaults.
     */
    var defaults = {
      // The class to set the active element to
      activeClass: 'html-outliner-active',
      // A callback to trigger every time the outline is modified
      updateCallback: 'someCallback',
      // A set of keycodes to map to operations
      keyCodes: {
        // The ctrl key
        modifier: 17,
        // The enter key
        newElement: 13,
        // Currently this is only the arrows, should require control?
        // The down arrow
        moveDown: 40,
        // The up arrow
        moveUp: 38,
        // The right arrow
        makeChild: 37,
        // The left arrow
        makeSibling: 39, 
        // The escape key
        quit: 27,
      },
      callBacks: {
        moveUp: item.moveUp,
        moveDown: item.moveDown,
        eventResponder: eventResponder,
        quit: uninitialize,
      }
    };  
    var options = $.extend(true, defaults, options);

    /**
     * Run our jQuery code!
     */
    return this.each(function() {  
      outline = $(this);
      outline.click(function(){
        intialize(outline);
      });
      // Respond to keyboard key presses.
      $(window).keydown(function(e) {
        // Track when modifier key is engaged.
        if(e.which == options.keyCodes.modifier) {
          modifierKeyIsDown=true;
        }
        keyboardResponder(e);
      });
      // Respond to keyboard key releases.
      $(window).keyup(function(e) {
        if(e.which == options.keyCodes.modifier) {
          // Track when modifier key is disengaged.
          modifierKeyIsDown=false;
        }
      });
    });
  };  
})(jQuery);  
