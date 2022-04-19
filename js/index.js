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

  // filterbutton container
  const filterButtons = $('input[name="rovatok"]')
  // header container
  const header = $('header')
  console.log(header);

  /**
   * Initialise demo.
   */
  function init() {

    _bindCards();
    _setupFilters()
  };
  
  /**
   * Set up filter filter filterButtons
   * @private
   */
  function _setupFilters() {
    
    // prefilter after reload
    var selectedRovat = document.querySelector('input[name="rovatok"]:checked').value;
    _handleFiltering(selectedRovat)

    // Bind radio buttons
    $.each(filterButtons, function(filterbutton) {
      $(filterbutton).on('change', _handleFiltering.bind(this, filterbutton.value));
      // Just in case:)
      $(filterbutton).on('click', _handleFiltering.bind(this, filterbutton.value));
    });
    
  };

  /**
   * Handle hiding and unhiding filtered cards
   * @private
   */
  function _handleFiltering(filter_value) {

    for (var i in layout) {
      var card = layout[i].card;
      var cardCategory = card.category;
      
      if ((filter_value == 'All') || (filter_value == cardCategory)) {
        card.isFiltered = true;
        card._el.classList.remove('filter--hidden');
        continue;
      }

      card.isFiltered = false;
      card._el.classList.add('filter--hidden');
    }
  }

  /**
   * Bind Card elements.
   * @private
   */
  function _bindCards() {

    var elements = $(SELECTORS.card);

    $.each(elements, function(card, i) {

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
      sequence.add(card.openCard(_onCardMove), 0);
      sequence.add(_showHideHeader(true), 0);

    } else {
      // Close sequence.

      var closeCard = card.closeCard();
      var position = closeCard.duration() * 0.8; // 80% of close card tween.

      sequence.add(closeCard);
      sequence.add(tweenOtherCards, position);
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

    TL.to(header, 0.4, {
      scale: (isHide ? 0.8 : 1),
      autoAlpha: (isHide ? 0 : 1),
      transformOrigin: 'center bottom',
      ease: Expo.easeInOut
    });

    return TL
  }

  /**
   * Callback to be executed on Tween update, whatever a polygon
   * falls into a circular area defined by the card width the path's
   * CSS class will change accordingly.
   * @param {Object} track The card sizes and position during the floating.
   * @private
   */
  function _onCardMove(track) {
    // not implemented
  }


  // Expose methods.
  return {
    init: init
  };

})(window);

// Kickstart Demo.
window.onload = demo.init;


// var body = document.getElementsByClassName('wrapper')[0]
// console.log(body);
// body.classList.add('sokvagyok')
// console.log(body);
// body.classList.add('sokvagyok')
// console.log(body);
// body.classList.add('sokvagyok')
// console.log(body);
