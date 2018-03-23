# ImageBox

## Whut?
An image uploader and gallery that uses Google Cloud Platform's Vision API to classify the images that are submitted, and then makes them searchable using Algolia and InstantSearch.

![What it could look like if you filled it with animal images...](https://cl.ly/2Q3m3w0X1M3Q/Image%202018-03-23%20at%2012.56.29%20pm.png)

## Set up and install
To work with your own version of this repo, you'll need to set up a few things in advance:

* Algolia Account [(get a free one here)](https://www.algolia.com/?utm_source=devreldemo&utm_medium=website&utm_campaign=imagebox-app)
* Google Cloud Platform Account [(get it here)](https://cloud.google.com/vision)

### Once you've got your credentials

Clone this repo and open the folder structure. Open the folder in your terminal and run:

```npm install```

Once all the libraries that the app depends on are installed you need to create an `.env` file in the folder to store all the different settings. You can copy the example below and replace the credentials with your own.

```
ALGOLIA_INDEX_NAME=imagebox-develop
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_KEY=your_algolia_admin_api_key
GOOGLE_APPLICATION_CREDENTIALS="google-service-account.json"
```

Note: You'll need to follow the guide for setting up the Google Service Account credentials to get your google-service-account.json set up. [Get that from here](https://cloud.google.com/vision/docs/reference/libraries) (be sure to use the examples for NodeJS).

### Then...

Run the app in development mode by typing `npm run dev` in your terminal.
