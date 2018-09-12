# Restaurant Reviews
#### _A three stage project required to complete the Udacity Mobile Web Specialist Nanodegree_
---

## Table of contents
- [Stage 1 - completed](#stage1)

- [Stage 2 - completed](#stage2)

- [Stage 3 - completed](#stage3)

<a name="stage1"/>

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality.

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.

---
### What I've changed
#### Responsive Design

- All content is responsive and displays on a range of display sizes.
- Content makes use of available screen real estate and displays correctly at all screen sizes.
- Images title renders next to the image in all viewport sizes.
- Images in the site are sized appropriate to the viewport and do not crowd or overlap other elements in the browser, regardless of viewport size.
- On the main page, restaurants and images are displayed in all viewports. The detail page includes a map, hours and reviews in all viewports.
#### Accessibility
- All content-related images include appropriate alternate text that clearly describes the content of the image.
- Focus is appropriately managed allowing users to noticeably tab through each of the important elements of the page. Modal or interstitial windows appropriately lock focus.
- Elements on the page use the appropriate semantic elements. For those elements in which a semantic element is not available, appropriate `ARIA roles` are defined.
#### Offline Availability
- When available in the browser, the site uses a service worker to cache responses to requests for site assets. Visited pages are rendered when there is no network access.

#### Before and after screenshots

<img src="https://github.com/chadpjontek/resources/raw/master/images/restaurant-reviews-stage1-home.jpg" title="restaurant reviews app home page before and after" alt="restaurant reviews app home page before and after">
<img src="https://github.com/chadpjontek/resources/raw/master/images/restaurant-reviews-stage1-restaurant.jpg" title="restaurant reviews app restaurant page before and after" alt="restaurant reviews app restaurant page before and after">
<img src="https://github.com/chadpjontek/resources/raw/master/images/restaurant-reviews-stage1-reviews.jpg" title="restaurant reviews app restaurant page before and after" alt="restaurant reviews app restaurant page before and after">

---
<a name="stage2"/>

## Project Overview: Stage 2

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage Two**, you will take the responsive, accessible design you built in **Stage One** and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### Specification

You will be provided code for a [Node development server](https://github.com/udacity/mws-restaurant-stage-2) and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the work of improving your **Stage One** project code.

The core functionality of the application will not change for this stage. Only the source of the data will change. You will use the `fetch()` API to make requests to the server to populate the content of your Restaurant Reviews app.

### Requirements

**Use server data instead of local memory** In the first version of the application, all of the data for the restaurants was stored in the local application. You will need to change this behavior so that you are pulling all of your data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.

**Use IndexedDB to cache JSON responses** In order to maintain offline use with the development server you will need to update the service worker to store the JSON received by your requests using the IndexedDB API. As with Stage One, any page that has been visited by the user should be available offline, with data pulled from the shell database.

**Meet the minimum performance requirements** Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using Lighthouse.

Lighthouse measures performance in four areas, but your review will focus on three:

- **Progressive Web App** score should be at 90 or better.
- **Performance** score should be at 70 or better.
- **Accessibility** score should be at 90 or better.

You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### Steps to complete

1. Fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-2). You’ll use this development server to develop your project code.
2. Change the data source for your restaurant requests to pull JSON from the server, parse the response and use the response to generate the site UI.
3. Cache the JSON responses for offline use by using the IndexedDB API.
4. Follow the recommendations provided by Lighthouse to achieve the required performance targets.
5. Submit your project code for review.
---
### What I've changed
I used **webpack** to help with compression, minification, linting, live editing, transpiling, bundling, and automating various tasks. The `webpack.common.js` file contains the shared configuration of both developement and production builds, whereas the `webpack.dev.js` and `webpack.prod.js` handle their respective builds.

**To test the project:**
1. Make sure the [Local Development API Server](https://github.com/chadpjontek/mws-restaurant-stage-2) is installed and started.
2. Clone this repo. `git clone https://github.com/chadpjontek/Restaurant-Reviews.git`
3. Install all dependencies. `npm i`
4. Navigate to the `dist` folder `cd dist` before running your local server `py -m http.server 8000`

> **Note:** I've created a dev and start script for development purposes which will overwrite or delete the `dist` directory. If you choose to use them you will need to re-build the production build for performance testing. Do this by running `npm run build`
#### Application Data and Offline Use
- The client application pulls restaurant data from the development server, parses the JSON response, and uses the information to render the appropriate sections of the application UI.
- The client application works offline. JSON responses are cached using the IndexedDB API. All data previously accessed while connected is reachable while offline.
#### Responsive Design and Accessibility
- The application maintains a responsive design on mobile, tablet and desktop viewports.
- The application retains accessibility features from the Stage 1 project. Images have alternate text, the application uses appropriate focus management for navigation, and semantic elements and ARIA attributes are used correctly.
#### Performance
- Lighthouse targets for each category exceed:
  - Progressive Web App: >90
  - Performance: >70
  - Accessibility: >90

#### Lighthouse scores

<img src="https://github.com/chadpjontek/resources/raw/master/images/restaurant-reviews-stage2-lighthouse-perf.jpg" title="restaurant reviews app lighthouse scores" alt="restaurant reviews app lighthouse scores">

---
<a name="stage3"/>

## Project Overview: Stage 3

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage Three**, you will take the connected application you built in **Stage One** and **Stage Two** and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### Specification

You will be provided code for an updated [Node development server](https://github.com/udacity/mws-restaurant-stage-3) and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the work of improving your **Stage Two** project code.

> This server is different than the server from stage 2, and has added capabilities. Make sure you are using the **Stage Three** server as you develop your project. Connecting to this server is the same as with **Stage Two**, however.

You can find the documentation for the new server in the README file for the server.

Now that you’ve connected your application to an external database, it’s time to begin adding new features to your app.

### Requirements

**Add a form to allow users to create their own reviews:** In previous versions of the application, users could only read reviews from the database. You will need to add a form that adds new reviews to the database. The form should include the user’s name, the restaurant id, the user’s rating, and whatever comments they have. Submitting the form should update the server when the user is online.

**Add functionality to defer updates until the user is connected:** If the user is not online, the app should notify the user that they are not connected, and save the users' data to submit automatically when re-connected. In this case, the review should be deferred and sent to the server when connection is re-established (but the review should still be visible locally even before it gets to the server.)

**Meet the new performance requirements:** In addition to adding new features, the performance targets you met in **Stage Two** have tightened. Using Lighthouse, you’ll need to measure your site performance against the new targets.

- **Progressive Web App** score should be at 90 or better.
- **Performance** score should be at **90** or better.
- **Accessibility** score should be at 90 or better.

You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### Steps to complete
1. Fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-3). You’ll use this development server to develop your project code.
2. Add a form to allow users to submit their own reviews.
3. Add functionality to defer submission of the form until connection is re-established.
4. Follow the recommendations provided by Lighthouse to achieve the required performance targets.
5. Submit your project code for review.
---
### What I've changed
> **Note:** I have a live demo of the project on netlify which can be viewed [here](https://restaurant-reviews-app.netlify.com/). I have cloned the development server to Glitch.com to work with the demo. You can however test the project locally by following these steps:
>
> 1. Make sure the [Local Development API Server](https://github.com/chadpjontek/mws-restaurant-stage-3) is installed and started.
> 2. Clone this repo. `git clone https://github.com/chadpjontek/Restaurant-Reviews.git`
> 3. Install all dependencies. `npm i`
> 4. In your terminal type `npm run build`
> 5. Navigate to the `dist` folder `cd dist` before running your local server `py -m http.server 8000`

#### User Interface
- Users are able to mark a restaurant as a favorite. I used a heart shaped SVG to act as a toggle button for this.
- A form is added to allow users to add their own reviews for a restaurant. This is accessed by clicking a button on the restaurant details page whcih displays a modal including the form. The form validates and submits the user input to be added to the database.
#### Offline Use
- The client application works offline. JSON responses are cached using the IndexedDB API. All data previously accessed while connected is reachable while offline.
- The User is able to add a review or favorite while offline and the request is sent to the server when connectivity is re-established.
#### Responsive Design
- The application maintains a responsive design on mobile, tablet and desktop viewports. All new features are responsive, including the form to add a review and the control for marking a restaurant as a favorite.
#### Accessibility
- The application retains accessibility features from the previous projects. Images have alternate text, the application uses appropriate focus management for navigation, and semantic elements and ARIA attributes are used correctly. Roles are correctly defined for all elements of the review form as well as the favorites SVG toggle "button".
#### Performance
- Lighthouse targets for each category exceed:
  - Progressive Web App: >90
  - Performance: >90
  - Accessibility: >90

#### Lighthouse scores

<img src="https://github.com/chadpjontek/resources/raw/master/images/restaurant-reviews-stage3-lighthouse-scores.jpg" title="restaurant reviews app lighthouse scores" alt="restaurant reviews app lighthouse scores">