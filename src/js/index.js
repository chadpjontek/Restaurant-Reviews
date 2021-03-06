/**
 * Service worker registration
 */
import registerSW from './registerSW';
registerSW();

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
 * lazysizes is a fast (jank-free), SEO-friendly and self-initializing lazyloader for images
 * (including responsive images picture/srcset), iframes, scripts/widgets and much more.
 * It also prioritizes resources by differentiating between crucial in view and near view elements
 *  to make perceived performance even faster.
 */
import lazySizes from 'lazysizes';

/**
 * create array to store responsive image data
 */
const responsiveImages = {};

/**
 * Update page and map for current restaurants.
 */
window.updateRestaurants = function () {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Get responsive images
 */
function getResponsiveImages() {
  for (let i = 1; i < 11; i++) {
    responsiveImages[i] = require(`../images/${i}.jpg`);
  }
}
getResponsiveImages();

/**
 * Initialize map, fetch restaurant data then store in the database,
 * and fetch neighborhoods and cuisines when the page loads.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
  DBHelper.saveFavoriteQueue((error, response) => {
    if (error) {
      return console.log(error);
    }
    DBHelper.updateRestaurants();
  });
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = self.cuisines) {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
function initMap() {
  window.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
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

  updateRestaurants();
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement('li');
  li.className = 'restaurants-list__li';
  const image = document.createElement('img');
  image.className = 'restaurants-list__li__img';
  if (restaurant.id !== 1) {
    image.className = 'lazyload';
  } else {
    image.setAttribute('src', responsiveImages[restaurant.id].placeholder);
    image.setAttribute('srcset', responsiveImages[restaurant.id].srcSet);
  }
  image.setAttribute('data-src', responsiveImages[restaurant.id].placeholder);
  image.setAttribute('data-srcset', responsiveImages[restaurant.id].srcSet);
  image.alt = `A picture taken from the restaurant ${restaurant.name}`;
  li.append(image);

  const name = document.createElement('h3');
  name.className = 'restaurants-list__li__name';
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.className = 'restaurants-list__li__neighborhood';
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.className = 'restaurants-list__li__address';
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.className = 'restaurants-list__li__a';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View details of ' + restaurant.name);
  li.append(more);

  // Create an accessible SVG that acts as a favorite toggle
  const favoriteButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const favoriteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  favoriteButton.classList.add('favorite-svg');
  favoriteIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon-heart');
  favoriteButton.setAttribute('id', `cb${restaurant.id}`);
  favoriteButton.setAttribute('role', 'button');
  favoriteButton.setAttribute('aria-labelledby', 'favorite-title favorite-desc');
  favoriteButton.setAttribute('tabindex', '0');
  favoriteIcon.classList.add('favorite-use');
  if (restaurant.is_favorite === 'true') {
    favoriteIcon.classList.add('is-favorite');
    favoriteButton.setAttribute('aria-pressed', 'true');
  } else {
    favoriteButton.setAttribute('aria-pressed', 'false');
  }
  favoriteButton.addEventListener('click', toggleFavorite.bind(null, restaurant.id));
  favoriteButton.addEventListener('keydown', handleBtnKeyPress.bind(null, restaurant.id));
  li.append(favoriteButton);
  favoriteButton.appendChild(favoriteIcon);
  return li;
}

/**
 * Handle keydown for favorite toggle buttons
 */
function handleBtnKeyPress(id, event) {
  console.log('id', id);
  console.log('event', event);

  if (event.key === ' ' || event.key === 'Enter') {
    console.log('fire!');
    event.preventDefault();
    toggleFavorite(id);
  }
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}

/**
 * Toggle favorite restaurant
 */
function toggleFavorite(id) {
  const favoriteButton = document.getElementById(`cb${id}`);
  const favoriteIcon = favoriteButton.firstChild;
  let is_favorite;
  // Get the current state of the favorite button
  if (favoriteIcon.classList.contains('is-favorite')) {
    is_favorite = 'true';
  } else {
    is_favorite = 'false';
  }
  // attempt to toggle
  DBHelper.toggleFavorite(id, is_favorite, (error, response) => {
    if (error && error !== 'favorited' && error !== 'unfavorited') {
      // Something went wrong
      console.log(error);
      return;
    }
    // User is offline
    if (error) {
      console.log(`Offline. ${error} added to queue.`);
    }
    // Change the state of the button
    if (is_favorite === 'true') {
      favoriteIcon.classList.remove('is-favorite');
      favoriteButton.setAttribute('aria-pressed', 'false');
      return;
    }
    favoriteIcon.classList.add('is-favorite');
    favoriteButton.setAttribute('aria-pressed', 'true');
  });
}

/**
 * When the user comes online...
 */
window.addEventListener('online', (() => {
  DBHelper.saveFavoriteQueue((error, response) => {
    if (error) {
      return console.log(error);
    }
    console.log(response);
    DBHelper.updateRestaurants();
  });
}));
