/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": ""
  }, collection)

  return app.save(collection)
})
