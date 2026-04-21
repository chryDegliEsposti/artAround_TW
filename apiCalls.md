# Navigator App (client_navigator)

## MapView.jsx
- API endpoint: /api/v1/navigator/museums/get
- Context: Fetches a list of nearby museums. Must integrate with map geolocation.
- Params: `name` (optional query)
- Fetched Data Structure:
  * id: string (ObjectId)
  * name: string
  * lat: number
  * lng: number
  * rating: number
  * img: string (URL)

## NavigatorApp.jsx
- API endpoint: /api/v1/navigator/museums/museumData
- Context: Fetches the full interactive map data (layers, POIs, walls).
- Params: None (GET)
- Fetched Data Structure:
  * museumCenter: [latitude, longitude]
  * layers: Array of { id, name }
  * lines: Array of { id, type (ext-wall|int-wall), points: [{lat, lng, x, y}], layerId }
  * areas: Array of { id, type, subType, name, points: [{lat, lng, x, y}], layerId }
  * pois: Array of { id, type, subType, name, position: {lat, lng, x, y}, layerId, desc }

- API endpoint: /api/v1/navigator/ai/AIResponse/${visitId} [TODO]
- Context: Fetches a text response for the AI curator's voice interface.
- Params: visitId (string)
- Fetched Data Structure:
  * message: string

## MyVisits.jsx
- API endpoint: /api/v1/navigator/visits/get/upcomingVisits
- Context: Fetches the list of upcoming visits for the current user.
- Params: None (GET)
- Fetched Data Structure:
  * id: string
  * museum: string
  * date: string
  * time: string
  * image: string (URL)
  * type: string

- API endpoint: /api/v1/navigator/visits/get/pastVisits
- Context: Fetches the history of past visits for the current user.
- Params: None (GET)
- Fetched Data Structure: (Same as upcomingVisits)

## BottomBar.jsx
- API endpoint: /api/v1/navigator/museums/item/:id
- Context: Fetches the detailed description of a specific exhibit item.
- Params: id (The unique identifier of the artwork/POI)
- Fetched Data Structure:
  * description: string

## Overview.jsx
- API endpoint: /api/v1/navigator/museums/get/:id
- Context: Fetches the high-level details of a museum (price, hours, address).
- Params: id (The unique identifier of the museum)
- Fetched Data Structure:
  * image: string (URL)
  * name: string
  * categories: Array of strings
  * accessibility: Array of strings
  * price: string
  * hours: string
  * address: string
  * description: string

## ExploreMuseum.jsx
- API endpoint: /api/v1/navigator/museums/exploreData
- Context: Fetches featured masterpieces and exhibitions for the explore section.
- Params: None (GET)
- Fetched Data Structure:
  * masterpieces: Array
  * exhibitions: Array
  * facilities: Array

## useSpeaker.js
- API endpoint: /api/v1/navigator/ai/request/speak
- Context: Sends text to be converted to speech (TTS).
- Params (POST BODY): text (string), lang (string), slow (boolean)
- Fetched Data Structure: { chunks: Array of base64 }

---

# Marketplace App (client_marketplace)

## login.html
- API endpoint: /api/v1/auth/login
- Context: Authenticates a user and returns a token.
- Params (POST BODY): email, password
- Fetched Data Structure: { status, token, user: {id, username, role} }

## registration.html
- API endpoint: /api/v1/auth/signup
- Context: Registers a new user.
- Params (POST BODY): username, email, password, role
- Fetched Data Structure: { status, token, user }

## homepage.html
- API endpoint: /api/v1/auth/logout
- Context: Logs out the user (clears session/cookie).
- Params: None (GET)
- Fetched Data Structure: { message }

- API endpoint: /api/v1/marketplace/notifications [middleware]
- Context: Fetches user notifications.
- Params: None (GET)
- Fetched Data Structure: { status, data: Array of notifications }

- API endpoint: /api/v1/marketplace/notifications/markAsRead/:id [middleware]
- Context: Marks a notification as read.
- Params: id (PATH)
- Fetched Data Structure: { status }

- API endpoint: /api/v1/marketplace/museums/getManaged [middleware]
- Context: Fetches museums managed by the creator.
- Params: None (GET)
- Fetched Data Structure: { status, data: Array of museums }

## browseMarket.html
- API endpoint: /api/v1/marketplace/browse/visits [middleware]
- Context: Fetches all public visits for browsing.
- Params: None (GET)
- Fetched Data Structure: { status, data: { visits, purchasedVisits, favoriteVisits } }

- API endpoint: /api/v1/marketplace/browse/items [middleware]
- Context: Fetches all public items for browsing.
- Params: None (GET)
- Fetched Data Structure: { status, data: { items, purchasedItems } }

- API endpoint: /api/v1/marketplace/purchase/visit [middleware]
- Context: Purchases a visit.
- Params (POST BODY): visitId, price
- Fetched Data Structure: { status, message }

- API endpoint: /api/v1/marketplace/purchase/item [middleware]
- Context: Purchases an item.
- Params (POST BODY): itemId, price
- Fetched Data Structure: { status, message }

- API endpoint: /api/v1/marketplace/favorites/toggle [middleware]
- Context: Toggles a favorite for a visit or item.
- Params (POST BODY): targetId, targetType
- Fetched Data Structure: { status, message }

## createItems.html
- API endpoint: /api/v1/marketplace/create/items [middleware]
- Context: Creates one or more museum items.
- Params (POST BODY): itemsData
- Fetched Data Structure: { status, message }

## createVisits.html
- API endpoint: /api/v1/marketplace/create/visits [middleware]
- Context: Creates a new museum visit.
- Params (POST BODY): visitData
- Fetched Data Structure: { status, message }

- API endpoint: /api/v1/marketplace/create/searchItems [middleware]
- Context: Searches for items to add to a visit.
- Params: query (GET)
- Fetched Data Structure: { status, data: Array of items }

## joinMuseum.html
- API endpoint: /api/v1/marketplace/museums/search [middleware]
- Context: Searches for museums to join.
- Params: query (GET)
- Fetched Data Structure: { status, data: Array of museums }

- API endpoint: /api/v1/marketplace/museums/join/:museumId [middleware]
- Context: Requests to join a museum’s team.
- Params: museumId (PATH)
- Fetched Data Structure: { status }

## newMuseum.html
- API endpoint: /api/v1/marketplace/museums/checkCode [middleware]
- Context: Checks if a museum code is valid/unique.
- Params: code (GET)
- Fetched Data Structure: { status, available }

- API endpoint: /api/v1/marketplace/museums/create [middleware]
- Context: Registers a new museum.
- Params (POST BODY): museumData
- Fetched Data Structure: { status, museum }

## myMuseums.html
- API endpoint: /api/v1/marketplace/museums/getManaged [middleware]
- Context: Fetches both owned and collaborated museums.
- Params: None (GET)
- Fetched Data Structure: { status, data: Array of museums }

- API endpoint: /api/v1/marketplace/museums/handleJoinRequest [middleware]
- Context: Accepts or rejects a collaboration request.
- Params (POST BODY): museumId, requestId, action
- Fetched Data Structure: { status, message }
