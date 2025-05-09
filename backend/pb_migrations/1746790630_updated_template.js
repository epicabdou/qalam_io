/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "name": "templates"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "name": "template"
  }, collection)

  return app.save(collection)
})
