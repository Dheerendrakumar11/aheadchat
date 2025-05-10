# Go to backend 

cd backend

#Install dependencies

npm install

#create .env file 

PORT=5000

MONGO_URI="MONGI_URI"

#Start the backend server

npm start


#fronted 

cd frontend

#Install dependencies

npm install

#Start React App

npm start

#Socket.IO Connection

The frontend connects to the backend via Socket.IO.

Make sure backend is running on http://localhost:5000 and CORS is enabled.
