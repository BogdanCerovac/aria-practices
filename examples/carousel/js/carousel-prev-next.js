/*
*   File:   carousel-prev-next.js
*
*   Desc:   Carousel widget with Previous and Next Buttons that implements ARIA Authoring Practices
*
*/

'use strict';

var CarouselPreviousNext = function (node, options) {
  // merge passed options with defaults
  options = Object.assign({ moreaccessible: false, paused: false, norotate: false }, (options || {}));

  // a prefers-reduced-motion user setting must always override autoplay
  var hasReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (hasReducedMotion.matches) {
    options.paused = true;
  }

  /* DOM properties */
  this.domNode = node;

  this.carouselItemNodes = node.querySelectorAll('.carousel-item');

  this.containerNode = node.querySelector('.carousel-items');
  this.liveRegionNode = node.querySelector('.carousel-items');
  this.pauseButtonNode = null;
  this.previousButtonNode = null;
  this.nextButtonNode = null;

  this.playLabel = 'Start automatic slide show';
  this.pauseLabel = 'Stop automatic slide show';

  /* State properties */
  this.forcePlay = false; // set once the user activates the play/pause button
  this.playState = !options.paused; // state of the play/pause button
  this.rotate = !options.paused; // state of rotation
  this.timeInterval = 5000; // length of slide rotation in ms
  this.currentIndex = 0; // index of current slide
  this.slideTimeout = null; // save reference to setTimeout

  // Pause Button

  var elem = document.querySelector('.carousel .controls button.rotation');
  if (elem) {
    this.pauseButtonNode = elem;
    this.pauseButtonNode.addEventListener('click', this.handlePauseButtonClick.bind(this));
  }

  // Previous Button

  elem = document.querySelector('.carousel .controls button.previous');
  if (elem) {
    this.previousButtonNode = elem;
    this.previousButtonNode.addEventListener('click', this.handlePreviousButtonClick.bind(this));
    this.previousButtonNode.addEventListener('focus', this.handleFocusIn.bind(this));
    this.previousButtonNode.addEventListener('blur', this.handleFocusOut.bind(this));
  }

  // Next Button

  elem = document.querySelector('.carousel .controls button.next');
  if (elem) {
    this.nextButtonNode = elem;
    this.nextButtonNode.addEventListener('click', this.handleNextButtonClick.bind(this));
    this.nextButtonNode.addEventListener('focus', this.handleFocusIn.bind(this));
    this.nextButtonNode.addEventListener('blur', this.handleFocusOut.bind(this));
  }

  // Carousel item events

  for (var i = 0; i < this.carouselItemNodes.length; i++ ) {
    var caouselItemNode = this.carouselItemNodes[i];

    // support stopping rotation when any element receives focus in the tabpanel
    caouselItemNode.addEventListener('focusin', this.handleFocusIn.bind(this));
    caouselItemNode.addEventListener('focusout', this.handleFocusOut.bind(this));

    var imageLinkNode = caouselItemNode.querySelector('.carousel-image a');

    if (imageLinkNode) {
      imageLinkNode.addEventListener('focus', this.handleImageLinkFocus.bind(this));
      imageLinkNode.addEventListener('blur', this.handleImageLinkBlur.bind(this));
    }

  }

  // initialize behavior based on options

  this.updatePlayState(this.rotate && !options.norotate);

  if (this.rotate && !options.norotate) {
    this.rotateSlides(false);
  }

  if (options.norotate) {
    this.disableRotation(true);
  }

  this.setAccessibleStyling(options.moreaccessible);

  // Handle hover events
  this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
  this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));

}

/* Public function to disable or enable rotation */
CarouselPreviousNext.prototype.disableRotation = function(disable) {
  console.log('[.disableRotation]: ' + disable + ' ' + typeof disable)
  if (disable) {
    this.updatePlayState(false);
  }
  this.pauseButtonNode.hidden = disable;
}

/* Public function to update controls/caption styling */
CarouselPreviousNext.prototype.setAccessibleStyling = function(accessible) {
  if (accessible) {
    this.domNode.classList.add('carousel-moreaccessible');
  }
  else {
    this.domNode.classList.remove('carousel-moreaccessible');
  }
}

CarouselPreviousNext.prototype.showCarouselItem = function (index) {

  this.currentIndex = index;

  for(var i = 0; i < this.carouselItemNodes.length; i++) {
    var carouselItemNode = this.carouselItemNodes[i];
    if (index === i) {
      carouselItemNode.classList.add('active');
    }
    else {
      carouselItemNode.classList.remove('active');
    }
  }
}

CarouselPreviousNext.prototype.previousCarouselItem = function () {
  var nextIndex = this.currentIndex - 1;

  if (nextIndex < 0) {
    nextIndex = this.carouselItemNodes.length - 1;
  }

  this.showCarouselItem(nextIndex);
}

CarouselPreviousNext.prototype.nextCarouselItem = function () {
  var nextIndex = this.currentIndex + 1;

  if (nextIndex >= this.carouselItemNodes.length) {
    nextIndex = 0;
  }

  this.showCarouselItem(nextIndex);
}

CarouselPreviousNext.prototype.rotateSlides = function (changeSlide) {
  if (changeSlide !== false) {
    this.nextCarouselItem();
  }

  this.slideTimeout = setTimeout(this.rotateSlides.bind(this), this.timeInterval);
}

CarouselPreviousNext.prototype.resetTimeout = function() {
  clearTimeout(this.slideTimeout);
  this.rotate = false;
  this.updateRotation();
}

CarouselPreviousNext.prototype.updateRotation = function() {

  var shouldRotate = !this.hasFocus && !this.hasHover && this.playState;
  if (shouldRotate === this.rotate) {
    return;
  }

  this.rotate = shouldRotate;

  if (shouldRotate) {
    this.rotateSlides(false);
  }
  else {
    clearTimeout(this.slideTimeout);
  }
}

CarouselPreviousNext.prototype.updatePlayState = function (play) {
  this.playState = play;
  this.updateRotation();

  if (!play) {
    this.pauseButtonNode.setAttribute('aria-label', this.playLabel);
    this.pauseButtonNode.classList.remove('pause');
    this.pauseButtonNode.classList.add('play');
    this.liveRegionNode.setAttribute('aria-live', 'polite');
  }
  else {
    this.pauseButtonNode.setAttribute('aria-label', this.pauseLabel);
    this.pauseButtonNode.classList.remove('play');
    this.pauseButtonNode.classList.add('pause');
    this.liveRegionNode.setAttribute('aria-live', 'off');
  }
}

  /* Event Handlers */

CarouselPreviousNext.prototype.handleImageLinkFocus = function () {
  this.liveRegionNode.classList.add('focus');
}

CarouselPreviousNext.prototype.handleImageLinkBlur = function () {
  this.liveRegionNode.classList.remove('focus');
}

CarouselPreviousNext.prototype.handleMouseOver = function (event) {
  if (!this.forcePlay) {
    if (!this.pauseButtonNode.contains(event.target)) {
      this.hasHover = true;
    }
    this.updateRotation();
  }
}

CarouselPreviousNext.prototype.handleMouseOut = function () {
  if (!this.forcePlay) {
    this.hasHover = false;
    this.updateRotation();
  }
}

  /* EVENT HANDLERS */

CarouselPreviousNext.prototype.handlePauseButtonClick = function () {
  this.forcePlay = true;
  this.updatePlayState(!this.playState);
}

CarouselPreviousNext.prototype.handlePreviousButtonClick = function () {
  this.previousCarouselItem();
}

CarouselPreviousNext.prototype.handleNextButtonClick = function () {
  this.nextCarouselItem();
}

  /* Event Handlers for carousel items*/

CarouselPreviousNext.prototype.handleFocusIn = function () {
  this.liveRegionNode.setAttribute('aria-live', 'polite');
  this.hasFocus = true;
  this.updateRotation();
}

CarouselPreviousNext.prototype.handleFocusOut = function () {
  if (this.playState) {
    this.liveRegionNode.setAttribute('aria-live', 'off');
  }
  this.hasFocus = false;
  this.updateRotation();
}

/* Initialize Carousel and options */

window.addEventListener('load', function () {
  var carouselEls = document.querySelectorAll('.carousel');
  var carousels = [];

  // set example behavior based on
  // default setting of the checkboxes and the parameters in the URL
  // update checkboxes based on any corresponding URL parameters
  var checkboxes = document.querySelectorAll('.carousel-options input[type=checkbox]');
  var urlParams = new URLSearchParams(location.search);
  var carouselOptions = {};

  // initialize example features based on
  // default setting of the checkboxes and the parameters in the URL
  // update checkboxes based on any corresponding URL parameters
  checkboxes.forEach(function(checkbox) {
    var checked = checkbox.checked;

    if (urlParams.has(checkbox.value)) {
      var urlParam = urlParams.get(checkbox.value);
      if (typeof urlParam === 'string') {
        checked = urlParam === 'true';
        checkbox.checked = checked;
      }
    }

    carouselOptions[checkbox.value] = checkbox.checked;
  });

  carouselEls.forEach(function (node) {
    carousels.push(new CarouselPreviousNext(node, carouselOptions));
  });

  // add change event to checkboxes
  checkboxes.forEach(function(checkbox) {
    var updateEvent;
    switch(checkbox.value) {
      case 'moreaccessible':
        updateEvent = 'setAccessibleStyling';
        break;
      case 'norotate':
        updateEvent = 'disableRotation';
        break;
    }

    // update the carousel behavior and URL when a checkbox state changes
    checkbox.addEventListener('change', function(event) {
      urlParams.set(event.target.value, event.target.checked + '');
      window.history.replaceState(null, '', window.location.pathname + '?' + urlParams);

      if (updateEvent) {
        carousels.forEach(function (carousel) {
          carousel[updateEvent](event.target.checked);
        });
      }
    });
  });
}, false);


