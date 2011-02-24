/**
 * @file
 *   This jQuery plugin provides a pluggable system for manipulating HTML outlines.
 *
 * TODO: Add pluggable callbacks.
 */
 /*
   TODO list:
     - allow complex modifiers
     - provide real callbacks
     - debug.
 */
(function($){  
  $.fn.HTMLOutline = function() {  

    // The outline that we have HTMLOutline-ified.
    var outline = undefined;

    // The current selected item.
    var activeItem = null;

    // Whether the modifier key is currently depressed.
    var modifierKeyIsDown = false;

    // Whether keybaord listening is currently active.
    var keyboardListening = false;

    // This is an event responder that responds to all events.
    var eventResponder = function() {}

    /**
     * Create our abstract (as far as js will allow) item handler.
     *
     * All elements in an outline are treated equally (each should be a list element which may or may not contain other list elements)
     */
    var util = function() {}

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    util.moveUp = function(current) {
      current.prev().before(current);
    }

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    util.moveDown = function(current) {
      current.next().after(current);
    }

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    util.makeChild = function(current) {
      previous = current.prev();
      if (!hasList(previous)) {
        // TODO: Add a list.
        var list = '<' + options.listType + '></' + options.listType + '>';
        $(previous).append(list);
      }
      $(options.listType, previous).first().append(current);
    }

    /**
     * Create our abstract (as far as js will allow) item handler.
     */
    util.makeSibling = function(current) {
      var directParent = current.parent()
      if (directParent.data('HTMLOutlinerEnabled') !== true) {
        directParent.parent().after(current);
      }
    }

    /**
     *
     */
    util.newElement = function(current) {
      current.add('.' + options.activeClass);
      //this.selectNext(current);
    }

    /**
     *
     */
    util.liify = function(thing) {
      thing.wrap('li').wrap(options.listType);
      return thing.parent().parent();
    }
    
    /**
     *
     */
    util.activate = function(current) {
      activeItem = current;
      current = $(current);
      current.addClass(options.activeClass);
      formify(current);
    }

    /**
     *
     */
    util.deactivate = function(current) {
      current.removeClass(options.activeClass);
      deformify(current);
    }

    /**
     *
     */
    util.selectNext = function(current) {
      this.deactivate(current);
      if (hasList(current)) {
        this.activate($(options.listType, current).first());
      }
      else {
        this.activate(current.next().first());
      }
    }

    /**
     *
     */
    util.selectPrev = function(current) {
      // If the above item has a list, move to the end of it.
      if (hasList(current.prev())) {
        this.activate(current.prev().children().last());
        this.deactivate(current);
      }
      else {
        this.activate(current.prev());
        this.deactivate(current);
      }
    }

    /**
     * The function serves as an event dispatcher which calls the appropriate callbacks
     */
    var keyboardResponder = function(event) {
      if (keyboardListening) {
        if (modifierKeyIsDown) {
          switch (event.keyCode) {
            case options.keyCodes.moveDown:
              event.preventDefault();
              util.moveDown(activeItem);
              break;
            case options.keyCodes.moveUp:
              event.preventDefault();
              util.moveUp(activeItem);
              break;
            case options.keyCodes.makeChild:
              event.preventDefault();
              util.makeChild(activeItem);
              break;
            case options.keyCodes.makeSibling:
              event.preventDefault();
              util.makeSibling(activeItem);
              break;
          }
        }
        // Non-modifier key commands.
        else {
          switch (event.keyCode) {
            case options.keyCodes.moveDown:
              event.preventDefault();
              util.selectNext($(activeItem));
              break;
            case options.keyCodes.moveUp:
              event.preventDefault();
              util.selectPrev($(activeItem));
              break;
            case options.keyCodes.newElement:
              event.preventDefault();
              util.newElement($(activeItem));
              break;
            case options.keyCodes.quit:
              event.preventDefault();
              uninitialize(outline);
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

    var formify = function(item) {
      var forchange = $('.' + options.outlinerLiWrapperClass, item).first();
      var text = forchange.html()
      forchange.html(getForm(text));
    }

    var deformify = function(current) {
      var formElement = $('#HTMLOutliner-active', current);
      var list = '';
      if (hasList(current)) {
        list = $(options.listType, current);
      }
      // This line doesn't have the right value in the demo on the sub items inside second item
      current.html('<div class="' + options.outlinerLiWrapperClass + '">' + formElement.val() + '</div>');
      $('.' + options.outlinerLiWrapperClass, current).after(list);
      formElement.remove();
    }

    var getForm = function(text) {
      form = '<form><input type="text" id="HTMLOutliner-active" name="HTMLOutliner" value="' + text + '"></form>'
      return form;
    }

    var hasList = function(item) {
      if ($(options.listType, item).length > 0) {
        return true;
      }
      return false;
    }

    var wrapElementContents = function(li) {
      if (hasList(li)) {
        $(li).wrapInner('<div class="' + options.outlinerLiWrapperClass + '"></div>');
        // This is the only clean way to wrap Element contents
        $('.' + options.outlinerLiWrapperClass, li).after($(options.listType, li));
      }
      else {
        $(li).wrapInner('<div class="' + options.outlinerLiWrapperClass + '"></div>');
      }
    }

    /**
     * TODO: get this actually working!
     */
    var unwrapElementContents = function(current) {
      var wrapper = $('.' + options.outlinerLiWrapperClass, current);
      var text = wrapper.html();
      wrapper.before(text);
      wrapper.remove();
    }

    var initialize = function(outline) {
      if (!outline.data('HTMLOutlinerEnabled')) {
        outline.data('HTMLOutlinerEnabled', true);
        $.each($('li', outline), function(index, value) {
          wrapElementContents(value);
        });
        // Activate keyboard listening.
        startKeyboardListeners();
        // Set the first element in the outline to the active element.
        activeItem = outline.children().first();
        util.activate(activeItem);
      }
    }

    var uninitialize = function(outline) {
      outline.data('HTMLOutlinerEnabled', false);
      stopKeyboardListeners();
      util.deactivate(activeItem);
      activeItem = undefined;
      // TODO: this is busted?
      $.each($('li', outline), function(index, value) {
        unwrapElementContents(value);
      });
    }

    /**
     * Populate our defaults.
     */
    var defaults = {
      // List type (acceptable types are ul and ol, all must use that type)
      listType: 'ul',
      // The class to set the active element to
      activeClass: 'html-outliner-active',
      // li contents wrapper class
      outlinerLiWrapperClass: 'html-outliner-item',
      // A callback to trigger every time the outline is modified
      updateCallback: 'someCallback',
      // A set of keycodes to map to operations
      keyCodes: {
        // The alt key
        modifier: 18,
        // The enter key
        newElement: 13,
        // Currently this is only the arrows, should require control?
        // The down arrow
        moveDown: 40,
        // The up arrow
        moveUp: 38,
        // The right arrow
        makeChild: 39,
        // The left arrow
        makeSibling: 37, 
        // The escape key
        quit: 27,
      },
      callBacks: {
        moveUp: util.moveUp,
        moveDown: util.moveDown,
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
        initialize(outline);
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
      initialize(outline);
    });
  };  
})(jQuery);  
