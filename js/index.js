'use strict';

/**
 * Demo.
 */
var demo = (function(window, undefined) {

  /**
   * Enum of CSS selectors.
   */
  var SELECTORS = {
    card: '.card',
    cardImage: '.card__image',
    cardClose: '.card__btn-close',
  };

  /**
   * Container of Card instances.
   */
  var layout = {};

  /**
   * Initialise demo.
   */
  function init() {

    // init/bind event listeners
    _bindCards();
    _bindFilters();

    // do the first filter
    var chosenRovat = $('input[name="rovatok"]:checked')[0].value;
    _handleFiltering(chosenRovat);
  };
  
  /**
   * Set up filter filter filterButtons
   * @private
   */
  function _bindFilters() {
    $('input[name="rovatok"]').each(function(_, btn) {
      $(btn).on('change', _handleFiltering.bind(this, btn.value))
    });
  }

  /**
   * Handle hiding and unhiding filtered cards
   * @private
   */
   function _handleFiltering(filter_value) {

    for (var i in layout) {
      var TL = new TimelineLite()

      var card = layout[i].card;
      var cardCategory = card.category;
      
      if ((filter_value == 'Összes') || (filter_value == cardCategory)) {
        card.isFiltered = true;
        TL.add(card.toggleFade(), 0)
        $(card._el).removeClass('filter--hidden')
        continue;
      }

      card.isFiltered = false;
      TL.add(card.toggleFade(), 0)
      $(card._el).addClass('filter--hidden')

      TL.play();
    }
  }

  /**
   * Bind Card elements.
   * @private
   */
  function _bindCards() {

    var elements = $(SELECTORS.card);

    $(elements).each(function(i, card) {

      var instance = new Card(i, card);

      layout[i] = {
        card: instance
      };

      var cardImage = $(card).find(SELECTORS.cardImage);
      var cardClose = $(card).find(SELECTORS.cardClose);

      $(cardImage).on('click', _playSequence.bind(this, true, i));
      $(cardClose).on('click', _playSequence.bind(this, false, i));
    });
  };

  /**
   * Create a sequence for the open or close animation and play.
   * @param {boolean} isOpenClick Flag to detect when it's a click to open.
   * @param {number} id The id of the clicked card.
   * @param {Event} e The event object.
   * @private
   *
   */
  function _playSequence(isOpenClick, id) {

    var card = layout[id].card;

    // Prevent when card already open and user click on image.
    if (card.isOpen && isOpenClick) return;

    // Prevent when card is filtered OUT
    if (!card.isFiltered) return;

    // Create timeline for the whole sequence.
    var sequence = new TimelineLite({paused: true});

    var tweenOtherCards = _showHideOtherCards(id);

    if (!card.isOpen) {
      // Open sequence.

      sequence.add(tweenOtherCards);
      sequence.set('body', {overflowY: 'hidden'})
      sequence.add(card.openCard(), 0);
      sequence.add(_showHideHeader(true), 0);

    } else {
      // Close sequence.

      var closeCard = card.closeCard();
      var position = closeCard.duration() * 0.8; // 80% of close card tween.

      sequence.add(closeCard);
      sequence.add(tweenOtherCards, position);
      sequence.set('body', {overflowY: 'auto'}, position)
      sequence.add(_showHideHeader(false), position);
    }
    
    sequence.play();
  };

  /**
   * Show/Hide all other cards.
   * @param {number} id The id of the clcked card to be avoided.
   * @private
   */
  function _showHideOtherCards(id) {

    var TL = new TimelineLite;

    var selectedCard = layout[id].card;

    for (var i in layout) {

      var card = layout[i].card;

      // When called with `openCard`.
      if (card.id !== id && !selectedCard.isOpen) {
        TL.add(card.hideCard(), 0);
      }

      // When called with `closeCard`.
      if (card.id !== id && selectedCard.isOpen) {
        TL.add(card.showCard(), 0);
      }
    }

    return TL;
  };

  /**
   * Show/Hide header
   * @param {boolean} isHide Flag to determine if hide or show header.
   * @private
   */
  function _showHideHeader (isHide) {

    var TL = new TimelineLite()

    TL.to('header', 0.4, {
      scale: (isHide ? 0.8 : 1),
      autoAlpha: (isHide ? 0 : 1),
      transformOrigin: 'center bottom',
      ease: Expo.easeInOut
    });

    return TL
  }

  // Expose methods.
  return {
    init: init
  };

})(window);

// Kickstart Demo.
$(document).ready(function() {
  demo.init()

  // navigation line
  var active = $('input[name="rovatok"]:checked')[0];
  $(active).parents('li').addClass('active');
  setUnderline();
})

// Navigation Line
var nav = $(".navigation");
var navLine = $(".navigation__line");

var pos = 0;
var wid = 0;

function setUnderline() {
  var active = $(".navigation .active");
  if (active.length) {
    pos = active[0].getBoundingClientRect().left;
    wid = active[0].getBoundingClientRect().width;
    navLine.css({
      'left': active[0].offsetLeft + "px",
      'width': wid + "px"
    })
  }
}

window.onresize = function() {
  setUnderline()
};

$(".navigation ul li label").each((i, elem) => {
  elem.onclick = function(e) {
    // e.preventDefault();

    var isActive = this.parentElement.classList.contains("active");
    var isAnimate = nav.hasClass("animate");
    if (!isActive && !isAnimate) {
      nav.addClass("animate");

      var _this = this;

      $(".navigation ul li").each((i, e) => $(e).removeClass("active"));
      
      try {

        var position = _this.parentElement.getBoundingClientRect();
        var width = position.width;

        if (position.x >= pos) {
          navLine.css({"width": position.x - pos + width + "px"})
          setTimeout(() => {
            navLine.css({
              "left": _this.parentElement.offsetLeft + "px",
              "width": width + "px",
              "transitionDuration": "150ms"
            })
            setTimeout(() => nav.removeClass("animate"), 150);
            $(_this.parentElement).addClass("active");
          }, 300);
        } else {
          navLine.css({
            'width': pos - position.left + wid + "px",
            'left': _this.parentElement.offsetLeft + "px"
          })

          setTimeout(() => {
            navLine.css({
              'width': width + "px",
              'transitionDuration': "150px"
            })
            setTimeout(() => nav.removeClass("animate"), 150);
            $(_this.parentElement).addClass("active");
          }, 300);
        }
      } catch (e) {}
      pos = position.left;
      wid = width;
    }
  }
});
