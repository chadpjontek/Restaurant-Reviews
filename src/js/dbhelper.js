/**
 * This is a tiny library that mirrors IndexedDB, but replaces the weird IDBRequest objects with promises, plus a couple of other small changes.
 */
import idb from 'idb';

/**
 * an open-source JavaScript library for mobile-friendly interactive maps
 */
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'; // Re-uses images from ~leaflet package
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/`; // Development server
    // return 'https://chadpjontek-mws-restaurant-stage-3.glitch.me/'; // Demo server
  }

  /**
   * Open IndexedDB if the browser supports service workers.
   */
  static openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    return idb.open('restaurant-reviews-app', 2, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          const store = upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id'
          });
          store.createIndex('cuisine', 'cuisine_type');
          store.createIndex('neighborhood', 'neighborhood');
        case 1:
          const reviewsStore = upgradeDb.createObjectStore('reviews', {
            keyPath: 'id'
          });
          reviewsStore.createIndex('restaurant', 'restaurant_id');
          upgradeDb.createObjectStore('reviewQueue', {
            autoIncrement: true
          });
          upgradeDb.createObjectStore('favoriteQueue', {
            autoIncrement: true
          });
      }
    });
  }

  /**
   * Called once on main page load to update restaurant data.
   */
  static updateRestaurants() {
    DBHelper.openDatabase()
      .then(db => {
        if (!db) return;
        fetch(DBHelper.DATABASE_URL + 'restaurants')
          .then(response => response.json())
          .then(restaurants => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach(restaurant => {
              store.put(restaurant);
            });
          });
      });
  }

  /**
   * Called once on restaurant page load to update review data.
   */
  static updateReviews(id) {
    DBHelper.openDatabase()
      .then(db => {
        if (!db) return;
        fetch(DBHelper.DATABASE_URL + 'reviews/?restaurant_id=' + id)
          .then(response => response.json())
          .then(reviews => {
            const tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            reviews.forEach(review => {
              store.put(review);
            });
          });
      });
  }

  /**
   * Get all restaurants from database.
   */
  static getRestaurantsFromDb() {
    return DBHelper.openDatabase()
      .then(db => {
        return db.transaction('restaurants')
          .objectStore('restaurants')
          .getAll();
      })
      .catch((error => console.log(`There was an error fetching the restaurants: ${error}`)));
  }

  /**
   * Get all reviews from database.
   */
  static getReviewsFromDB(id) {
    return DBHelper.openDatabase()
      .then(db => {
        return db.transaction('reviews')
          .objectStore('reviews')
          .index('restaurant')
          .getAll(parseInt(id));
      })
      .catch((error => console.log(`There was an error fetching the restaurants: ${error}`)));
  }

  /**
   * Fetch all restaurants.
   * Get from db if available, otherwise get from network.
   */
  static fetchRestaurants(callback) {
    DBHelper.getRestaurantsFromDb()
      .then(restaurants => {
        if (restaurants.length > 0) {
          console.log('fetching restaurants from database');
          callback(null, restaurants);
        } else {
          console.log('fetching restaurants from network');
          fetch(DBHelper.DATABASE_URL + 'restaurants')
            .then(response => response.json())
            .then(restaurants => callback(null, restaurants));
        }
      })
      .catch((error => console.log(`There was an error fetching the restaurants: ${error}`)));
  }

  /**
   * Fetch reviews by restaurant.
   * Get from db if available, otherwise get from network.
   */

  static fetchReviewsById(id, callback) {
    DBHelper.getReviewsFromDB(id)
      .then(reviews => {
        if (reviews.length > 0) {
          console.log('fetching reviews from database');
          callback(null, reviews);
        } else {
          console.log('fetching reviews form network');
          fetch(DBHelper.DATABASE_URL + 'reviews/?restaurant_id=' + id)
            .then(response => response.json())
            .then(reviews => callback(null, reviews));
        }
      })
      .catch((error => console.log(`There was an error fetching the reviews: ${error}`)));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      });
    marker.addTo(map);
    return marker;
  }

  /**
   * User attempt to add a review
   */
  static addReview(formData, id, callback) {
    // Attempt to POST review to server.
    DBHelper.postReview(formData)
      .then(() => {
        callback(null, 'Review Added!');
      }).catch((error) => {
        // Fetch failed so add to queue to POST when online
        DBHelper.addToReviewQueue(formData, (err, res) => {
          if (err) {
            callback(err, null, true);
          } else {
            callback(res, null);
          }
        });
      });
  }

  /**
   * Add to queue
   */
  static addToReviewQueue(formData, callback) {
    DBHelper.openDatabase()
      .then(db => {
        const tx = db.transaction('reviewQueue', 'readwrite');
        tx.objectStore('reviewQueue')
          .put(formData)
          .then(() => {
            callback(null, 'It appears you\'re offline. We\'ll post your review as soon as you connect!');
          });
        return tx.complete;
      })
      .catch(error => {
        callback('It appears you\'re offline. Please try again later.', null);
      });
  }

  /**
   * POST a review
   */
  static postReview(review) {
    return fetch(DBHelper.DATABASE_URL + 'reviews', {
      body: JSON.stringify(review),
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  /**
   * Attempt to post the pending reviews
   */
  static postReviewQueue(callback) {
    DBHelper.openDatabase()
      .then(db => {
        const tx = db.transaction('reviewQueue', 'readwrite');
        const store = tx.objectStore('reviewQueue');
        // Open a cursor then
        return store.openCursor();
      }).then(function postNextInQueue(cursor) {
        if (!cursor) return;
        DBHelper.postReview(cursor.value);
        cursor.delete();
        return cursor.continue()
          .then(postNextInQueue);
      }).then(() => {
        callback(null, 'You are back online and your review has been posted!');
      })
      .catch(error => callback(error, null));
  }

  /**
   * Toggle favorite
   */
  static toggleFavorite(id, is_favorite, callback) {
    // Attempt to toggle favorite
    if (is_favorite === 'true') {
      DBHelper.openDatabase()
        .then(db => {
          if (!db) return;
          DBHelper.putFavorite(id, is_favorite)
            .then(response => response.json())
            .then(restaurant => {
              const tx = db.transaction('restaurants', 'readwrite');
              const store = tx.objectStore('restaurants');
              store.put(restaurant);
              callback(null, 'unfavorited');
            })
            .catch((error) => {
              // Something went wrong when favoriting so add to queue
              DBHelper.addToRestaurantQueue(id, is_favorite, (err, res) => {
                if (err) {
                  callback(err, null);
                } else {
                  callback('unfavorited', null);
                }
              });
            });
        })
        .catch(error => console.log(error));
    } else {
      DBHelper.openDatabase()
        .then(db => {
          if (!db) return;
          DBHelper.putFavorite(id, is_favorite)
            .then(response => response.json())
            .then(restaurant => {
              const tx = db.transaction('restaurants', 'readwrite');
              const store = tx.objectStore('restaurants');
              store.put(restaurant);
              callback(null, 'favorited');
            })
            .catch((error) => {
              // Something went wrong when favoriting so add to queue
              DBHelper.addToRestaurantQueue(id, is_favorite, (err, res) => {
                if (err) {
                  callback(err, null);
                } else {
                  callback('favorited', null);
                }
              });
            });
        })
        .catch(error => console.log(error));
    }
  }

  /**
   * PUT favorite
   */
  static putFavorite(id, is_favorite) {
    // toggle the favorite before submitting to the server
    if (is_favorite === 'false') {
      is_favorite = 'true';
    } else {
      is_favorite = 'false';
    }
    return fetch(`${DBHelper.DATABASE_URL}restaurants/${id}/?is_favorite=${is_favorite}`, {
      mode: 'cors',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  /**
   * Add favorite to queue to add when online
   */
  static addToRestaurantQueue(id, is_favorite, callback) {
    DBHelper.openDatabase()
      .then(db => {
        const tx = db.transaction('favoriteQueue', 'readwrite');
        const restaurantData = { id, is_favorite };
        tx.objectStore('favoriteQueue')
          .put(restaurantData)
          .then(() => {
            callback(null, 'It appears you\'re offline but we\'ll remember your favorite and save it when you connect!');
          });
        return tx.complete;
      })
      .catch(error => {
        callback('It appears you\'re offline. Please try again later.', null);
      });
  }

  /**
   * Attempt to post the pending favorite changes
   */
  static saveFavoriteQueue(callback) {
    DBHelper.openDatabase()
      .then(db => {
        const tx = db.transaction('favoriteQueue', 'readwrite');
        const store = tx.objectStore('favoriteQueue');
        // Open a cursor then
        return store.openCursor();
      }).then(function postNextInQueue(cursor) {
        if (!cursor) return;
        DBHelper.putFavorite(cursor.value.id, cursor.value.is_favorite);
        cursor.delete();
        return cursor.continue()
          .then(postNextInQueue);
      }).then(() => {
        callback(null, 'You are back online and your favorite has been saved!');
      })
      .catch(error => callback(error, null));
  }
}