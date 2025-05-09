/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.auth.isAdmin = true",
    "updateRule": "@request.auth.id != \"\" && @request.auth.isAdmin = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3610134426")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.isAdmin = true",
    "updateRule": "@request.auth.isAdmin = true"
  }, collection)

  return app.save(collection)
})
