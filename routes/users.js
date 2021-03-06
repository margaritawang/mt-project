const express = require("express");
const router = express.Router();

module.exports = knex => {
  router.get("/", (req, res) => {
    const getMaps = knex.select("*").from("maps");
    const getPoints = knex.select("*").from("points");

    Promise.all([getMaps, getPoints]).then(results => {
      const maps = results[0];
      const points = results[1];
      res.send(results);
    });
    // const mapsWithPoints = maps.map(map => {
    //   map.points = points.filter(point => point.maps_id === map.id);
    //   return map;
    // res.json(results);
    // });
    // res.json({maps: mapsWithPoints, points});
  });

  router.get("/maps/:id", (req, res) => {
    knex
      .select("*")
      .from("points")
      .where("maps_id", req.params.id)
      .then(results => {
        if (results.length) {
          return res.json(results);
        } else {
          return res.send({ error: "not found" });
        }
      });
  });

  router.get("/points/:id", (req, res) => {
    knex
      .select("*")
      .from("points")
      .where("id", req.params.id)
      .then(results => {
        res.json(results);
    });
  });

  router.post("/maps", (req, res) => {
    console.log(req.session.user_id);
    knex("maps")
      .returning("id")
      .insert({
        users_id: req.session.user_id,
        title: req.body.mapname,
        longitude: -123.116226,
        latitude: 49.246292
      })
      .then(function(id) {
        console.log("id=", id);
        console.log("typeof id=", typeof id);
        res.json(id);
      });

  })

  // Insert a point into current map
  router.post('/maps/:id/points', (req, res) => {
    knex('points')
      .insert(req.body)
      .then(() => {
        return res.sendStatus(200);
      })
  })

  // Favorite a map
  router.post('/like', (req, res) => {
    knex.select('*').from("fav_maps")
      .where({
        "maps_id": req.body.maps_id,
        "users_id": req.body.users_id})
      .then(results => {
        if (results.length) {
          let state = true;
          res.send(state);
        } else {
          knex('fav_maps')
            .insert(req.body)
            .then(() => {
              return res.sendStatus(200);
          })
        }
      });
  })

  // Load profile page
  router.get("/profile", (req, res) => {
    knex.select("*")
    .from("maps")
    .where("users_id", req.session.user_id)
    const userMaps = knex.select("*").from("maps").where("users_id", req.session.user_id);
    const userPoints = knex.select("*").from("points");
    const favMaps = knex('maps').distinct().innerJoin('fav_maps','maps.id', 'fav_maps.maps_id').where('fav_maps.users_id', req.session.user_id);
    Promise.all([userMaps, userPoints, favMaps]).then(results => {
      res.send(results);
    });
  });

  // Edit points
  router.post("/points/:id", (req, res) => {
    console.log(req.body);
    if (!req.body.title) {
      knex("points")
        .returning("maps_id")
        .where({ id: req.params.id })
        .update({ description: req.body.description })
        .then((maps_id) => {
          return res.send(maps_id);
        });
    } else if (!req.body.description) {
      knex("points")
        .returning("maps_id")
        .where({ id: req.params.id })
        .update({ title: req.body.title })
        .then((maps_id) => {
          return res.send(maps_id);
        });
    } else {
      knex("points")
        .returning("maps_id")
        .where({ id: req.params.id })
        .update({
          title: req.body.title,
          description: req.body.description })
        .then((maps_id) => {
          return res.send(maps_id);
        });
    }
  });

  // Delete points
  router.post("/points/:id/delete", (req, res) => {
    knex("points")
      .returning('maps_id')
      .where({ id: req.params.id })
      .del()
      .then((maps_id) => {
        return res.send(maps_id);
      })
  });
  return router;
};
