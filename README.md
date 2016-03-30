<img alt="loading..." src=./README_images/polygon.png width=172 height=121.5 />

# POLYGON STADIUM
### by Keenan Hoffman

970-999-4223

keenan.m.hoffman@gmail.com

[LinkedIn](www.linkedin.com/in/keenanhoffman)

### [Play Polygon Stadium](https://polygonstadium.com)

## Description

Polygon Stadium if an arena based first person shooter, where players progress through rounds of increasing difficulty destroying enemies.

## Tech Notes

The game itself was created with the 3D rendering library, THREE.js and the physics library, CANNON.js. The app uses Angular on the front-end and the game is wrapped in a directive. The Backend API was created with NODE, Postgrsql, and Express. It also uses an ORM called Waterline for database setup and queries.

## Getting Started
Clone the game
```
$ git clone git@github.com:KeenanHoffman/polygon-stadium.git
$ cd polygon-stadium
```
Install Node Modules
```
$ npm install
```
Install Bower Components
```
$ cd client
$ bower install
```
Build the Dist With Gulp
```
$ gulp
```
Start the Front-End Server From Within the **dist** Directory

Start the Back-End Server From Within the **server** Directory

<img alt="loading..." src=./README_images/screenshot_1.png width=900 />

## How to Play
#### Objectives
* Destroy enemies by shooting.
* Complete rounds by destroying all enemies.
* Compete for the top scores.
* Compete to reach the highest rounds.

#### Movement
* W A S D Moves
* SPACE Jumps
* MOUSE Looks
* CLICKING Shoots
* ESCAPE Pauses

#### Additional Info
* Your game is saved after each round and after you lose...
* Once you beat rounds that are multiples of 5 you can start from those rounds if you lose.
* Enemy difficulty increases as you progress through rounds.

#### Tips
* Click both left and right to increase firing speed.
* Hugging the wall makes it difficult for enemies to surprise you.

## Full Tech List
* [THREE.js](http://threejs.org)
* [CANNON.js](http://www.cannonjs.org)
* [TWEEN.js](https://github.com/tweenjs/tween.js)
* [AngularJS](https://angularjs.org)
* [Express](http://expressjs.com)
* [Waterline](http://sailsjs.org/documentation/reference/waterline-orm)
* [Heroku](https://heroku.com)
* [Firebase](https://www.firebase.com)
* [Bootstrap](http://getbootstrap.com)
* [Gulp](http://gulpjs.com)
