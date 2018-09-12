
/**
 * Service worker registration
 */
import registerSW from './registerSW';

/**
 * Common database helper functions.
 */
import DBHelper from './dbhelper';

/**
 * an open-source JavaScript library for mobile-friendly interactive maps
 */
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'; // Re-uses images from ~leaflet package
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

/**
 * main styles
 */
import '../styles/styles.scss';

/**
 * create array to store responsive image data
 */
const responsiveImages = {};

/**
 * when the DOM loads...
 */
document.addEventListener('DOMContentLoaded', () => {
  registerSW();
  const restaurant_id = parseInt(getParameterByName('id'));
  DBHelper.postReviewQueue((error, response) => {
    if (error) {
      return console.log(error);
    }
    const elems = Array.from(document.getElementsByClassName('offline'));
    elems.forEach(e => e.classList.remove('offline'));
    DBHelper.updateReviews(restaurant_id);
  });
  init();
  for (let i = 1; i < 11; i++) {
    responsiveImages[i] = require(`../images/${i}.jpg`);
  }
});

/**
 * Initialize page
 */
function init() {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      window.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiY3Bqb250ZWsiLCJhIjoiY2ppYXR6eWYwMWI4eTNqbXJoazg3NW1tdiJ9.yqKJzj0kA-fkP1ZgVR0a8g',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(window.newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
  fetchReviewsFromURL((error, reviews) => {
    if (error) { // Got an error!
      console.log(error);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback) {
  // if (self.restaurant) { // restaurant already fetched!
  //   callback(null, self.restaurant);
  //   return;
  // }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

/**
 * Get current reiviews from page URL.
 */
function fetchReviewsFromURL(callback) {
  if (self.reviews) { // Reviews already fetched!
    callback(null, self.reviews);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restuarant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchReviewsById(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
      callback(null, reviews);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.src = responsiveImages[restaurant.id].src;
  image.setAttribute('srcset', responsiveImages[restaurant.id].srcSet);
  image.alt = `A picture taken from the restaurant ${restaurant.name}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.className = 'restaurant-hours__day';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.className = 'restaurant-hours__time';
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.reviews) {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.className = 'reviews-container__title';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.reverse().forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'reviews-list__li__name';
  li.appendChild(name);
  li.className = 'reviews-list__li';

  const date = document.createElement('span');
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  date.innerHTML = new Date(review.updatedAt).toLocaleString('en-US', options);
  date.className = 'reviews-list__li__date';
  name.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'reviews-list__li__rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'reviews-list__li__comments';
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant = self.restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.className = 'breadcrumb__li';
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Add review modal
 */
// Will hold previously focused element
let focusedElementBeforeModal;

// Get the modal
const addReviewModal = document.getElementById('add-review-modal');

// Get the button that opens the modal
const addReviewBtn = document.getElementById('add-review');

// Get the button element that closes the modal
const cancel = document.getElementsByClassName('cancel')[0];

// When the user clicks on the button, open the modal
addReviewBtn.onclick = function () {
  // Save current focus
  focusedElementBeforeModal = document.activeElement;
  // Listen for and trap the keyboard
  addReviewModal.addEventListener('keydown', trapTabKey);
  // Find all focusable children
  const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
  let focusableElements = addReviewModal.querySelectorAll(focusableElementsString);
  // Convert Nodelist to Array
  focusableElements = Array.prototype.slice.call(focusableElements);
  const firstTabStop = focusableElements[0];
  const lastTabStop = focusableElements[focusableElements.length - 1];
  // Display modal
  addReviewModal.style.display = 'block';
  // Focus first child
  firstTabStop.focus();

  function trapTabKey(e) {
    // Check for TAB key press
    if (e.keyCode === 9) {

      // SHIFT + TAB
      if (e.shiftKey) {
        if (document.activeElement === firstTabStop) {
          e.preventDefault();
          lastTabStop.focus();
        }

        // TAB
      } else {
        if (document.activeElement === lastTabStop) {
          e.preventDefault();
          firstTabStop.focus();
        }
      }
    }

    // ESCAPE
    if (e.keyCode === 27) {
      closeModal();
    }
  }
};

// When the user clicks on cancel btn, close the modal
cancel.onclick = function () {
  closeModal();
};

function closeModal() {
  addReviewModal.style.display = 'none';
  focusedElementBeforeModal.focus();
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == addReviewModal) {
    addReviewModal.style.display = 'none';
  }
};

// Add Review
window.addReview = function () {
  event.preventDefault();
  const restaurant_id = parseInt(getParameterByName('id'));
  const name = document.getElementById('name');
  const rating = document.querySelector('input[name="rating"]:checked');
  const comments = document.getElementById('review');
  if (name.value === '') {
    return name.classList.add('invalid');
  } else {
    name.classList.remove('invalid');
  }
  if (rating === null || isNaN(rating.value)) {
    return document.getElementById('rating-label').classList.add('invalid');
  } else {
    document.getElementById('rating-label').classList.remove('invalid');
  }
  if (comments.value === '') {
    return comments.classList.add('invalid');
  } else {
    comments.classList.remove('invalid');
  }
  const formData = {
    restaurant_id: restaurant_id,
    name: cleanInput(name.value),
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: rating.value,
    comments: cleanInput(comments.value)
  };
  DBHelper.addReview(formData, restaurant_id, (error, response, unQueueable) => {
    // Offline and unable to queue for later
    if (unQueueable) {
      console.log(error);
      closeModal();
      displayMsgModal(error, 'error');
      return;
    }
    // Offline and added to the queue
    if (error && !unQueueable) {
      console.log(error);
      const ul = document.getElementById('reviews-list');
      const li = ul.appendChild(createReviewHTML(formData));
      const liName = li.querySelector('.reviews-list__li__name');
      liName.classList.add('offline');
      ul.insertBefore(li, ul.childNodes[0]);
      closeModal();
      name.value = null;
      comments.value = null;
      displayMsgModal(error, 'error');
      return;
    }
    // Review added
    if (error === null) {
      console.log(response);
      DBHelper.updateReviews(restaurant_id);
      const ul = document.getElementById('reviews-list');
      const li = ul.appendChild(createReviewHTML(formData));
      ul.insertBefore(li, ul.childNodes[0]);
      closeModal();
      name.value = null;
      comments.value = null;
      displayMsgModal(response, 'success');
      return;
    }
  });
};

/**
 * Message modal on review submission
 */
function displayMsgModal(message, type) {
  const msgModal = document.getElementById('msg-modal');
  const content = document.getElementById('msg-modal-content');
  fadeIn(content);
  msgModal.style.display = 'block';
  content.classList.toggle('fadeIn');
  const msg = document.getElementById('msg');
  msg.innerHTML = message;
  if (type === 'error') {
    content.classList.remove('success');
    content.classList.add('error');
  } else {
    content.classList.remove('error');
    content.classList.add('success');
  }
  setTimeout(() => {
    fadeOut(content);
  }, 4500);
  setTimeout(() => {
    msgModal.style.display = 'none';
  }, 5000);
}

function fadeOut(message) {
  message.style.opacity = 1;

  (function fade() {
    if ((message.style.opacity -= .1) < 0) {
      message.style.display = 'none';
      message.classList.add('isDisplayed');
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

function fadeIn(message) {
  if (message.classList.contains('isDisplayed')) {
    message.classList.remove('isDisplayed');
  }
  message.style.opacity = 0;
  message.style.display = 'block';

  (function fade() {
    var val = parseFloat(message.style.opacity);
    if (!((val += .1) > 1)) {
      message.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

// Prevent HTML and script injections on client
function cleanInput(input) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * When the user comes online...
 */
window.addEventListener('online', (() => {
  const restaurant_id = parseInt(getParameterByName('id'));
  DBHelper.postReviewQueue((error, response) => {
    if (error) {
      return console.log(error);
    }
    const elems = Array.from(document.getElementsByClassName('offline'));
    elems.forEach(e => e.classList.remove('offline'));
    displayMsgModal(response, 'success');
    DBHelper.updateReviews(restaurant_id);
  });
}));