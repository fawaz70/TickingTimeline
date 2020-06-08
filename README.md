YOUTUBE URL: https://www.youtube.com/watch?v=gVLy95yfs5w&feature=youtu.be



# project-ticking-timeline
project-ticking-timeline created by GitHub Classroom

Project Title:
    - Typical Timeline

Team Members
    - Fawaz Pirzada
    - Muizz Ahmed

Description:
    - Just a website that allows us to create and update our own timeline where events can store a file that made the specific day memorable such as a video, image, or along with it.
    - Timelines would keep track of the dates of these events and each user would have their own private timeline that could span years of their life so one day they can look back to their collection of memories.

Key features:
    - Static Timeline
    - User can add data to timeline (video, pictures, text) to a specific date
    - Setting menu to customize timeline preferences when it comes to format and overall themes
    - User timeline data will be stored in a database 

Additional Features:
    - Users can log in and have their timeline private from other users
    - signout/signup/security
    - Geolocation preference
    - Possibly connecting account to facebook to automatically make a timeline of previous events

Technology:
    - HTML
    - CSS
    - Javascript
    - Node.js
    - Mongo DB 


Top 5 Technical Challenges:
    1. Time: Since there is a lot of work to be done, sorting everything out between 2 users will be hefty
    2. User Freedom: Trying to give the user a lot of freedom when it comes to customizations will be difficult to manage
    3. Data storage: A lot of data can be passed around especially for just one user when all sorts of files are allowed
    4. Facebook tracking: Will be unquestionably tough due to there being multiple privacy settings, lots of data and etc which will be tough to convert into a timeline
    5. User Security: Timelines are private to the user since there can be sensitive data sotred over the years for someone therefore strong security becomes another technical challenge

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1. Signup

    - Method: 'POST'
    - Url: `/signup/`
    - Response body (JSON object): `{"username": "fawaz" "password": "123" picture: file}`

    $ curl -H "Content-Type: application/json" -X POST -d '{"username":"fawaz","password":"123" picture: file}' -c cookie.txt localhost:3000/signup/

2. Signin

    - Method: 'POST'
    - Url: `/signin/`
    - Response body (JSON object): `{"username": "fawaz" "password": "123"}`

    $ curl -H "Content-Type: application/json" -X POST -d '{"username":"fawaz","password":"123"}' -c cookie.txt localhost:3000/signin/

3. Signout

    - Method: 'GET'
    - Url: `/signout/`

    $ curl -H "Content-Type: application/json" -X --request GET -c cookie.txt localhost:3000/signout/

4. addCapsule

    - Method: `POST`
    - Url: `/api/seed/?seed="384fu39f"/`
    - Request body  (JSON object): `{caption: "mycapsule", "date": "jan 28 1996", seed:"384fu39f" ,picture: file}`
    - Body (JSON object): `{"_id": "54thi35tj",caption: "mycapsule", date: "jan 28 1996", seed:"384fu39f" ,picture: file}`

    $ curl --verbose --request POST --header 'Content-Type: application/json' --data '{caption: "mycapsule", date: "jan 28 1996", seed:"384fu39f" ,picture: file}' http://localhost:3000/api/addCapsule

5. addSeed

    - Method: `POST`
    - Url: `/api/fawaz/seeds/`
    - Request body  (JSON object): `{"title": "my first tree", "date": "jan 28 1996", "owner": "fawaz", "caption": "welcome"}`
    - Body (JSON object): `{"_id": "f8hfwf","title": "my first tree", "date": "jan 28 1996", "owner": "fawaz", "caption": "welcome"}`

    $ curl --verbose --request POST --header 'Content-Type: application/json' --data '{"title": "my first tree", "date": "jan 28 1996", "owner": "fawaz", "caption": "welcome"}' http://localhost:3000/api/" + fawaz + "/seeds/

6. getSeeds

    - Method: `GET`
    - Url: `/api/fawaz/seeds/`
    - Request body  (JSON object): {"_id": "f8hfwf"}
    - Response body (JSON list): `[{"_id": "f8hfwf","title": "my first tree", "date": "jan 28 1996", "owner": "fawaz", "caption": "welcome"}]`

    $ curl --verbose --request GET --header 'Content-Type: application/json' http://localhost:3000/api/fawaz/seeds/

7. getTree
    
    - Method: `GET`
    - Url: `/api/f8hfwf/capsule/`
    - Request body  (JSON object): {"_id": "54thi35tj"}
    - Response body (JSON list): `[{caption: "mycapsule", "date": "jan 28 1996", seed:"384fu39f" ,picture: file}]`

    $ curl --verbose --request GET --header 'Content-Type: application/json' http://localhost:3000/api/f8hfwf/capsule/

8. getSeed

    - Method: `GET`
    - Url: `/api/seeds/title/?seed=f8hfwf`
    - Request body  (JSON object): {"_id": "f8hfwf"}
    - Response body (JSON list): `[{"_id": "f8hfwf","title": "my first tree", "date": "jan 28 1996", "owner": "fawaz", "caption": "welcome"}]`

    $ curl --verbose --request GET --header 'Content-Type: application/json' http://localhost:3000/api/seeds/title/?seed=f8hfwf


9. delTimeline

    - Method: `DELETE`
    - Url: `/api/seeds/?seed=f8hfwf`
    - Response body (JSON object): `{"_id": "f8hfwf"}`

    $ curl --verbose --request DELETE --header 'Content-Type: application/json' http://localhost:3000/api/seeds/?seed=f8hfwf