/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select2747688147",
    "maxSelect": 1,
    "name": "subscription",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "plus",
      "pro",
      "entreprise"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select2747688147",
    "maxSelect": 1,
    "name": "subscription",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "plus",
      "pro",
      "entreprise"
    ]
  }))

  return app.save(collection)
})
