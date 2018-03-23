require('dotenv').config()
const express   = require('express');
const vision    = require('@google-cloud/vision');
const algolia   = require('algoliasearch');
const multer    = require('multer');
const ejs       = require('ejs');
const path      = require('path');

const client    = algolia(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index     = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

// Set up Express
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// Set up our Image Annotator
const imageClient = new vision.ImageAnnotatorClient();

// Set up where the uploaded images should live
const storage = multer.diskStorage({
  destination: './public/images/',
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + path.parse(file.originalname).name + path.extname(file.originalname));
  }
});

// Define an uploader and settings
const uploader = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    isFileAllowed(file, cb);
  }
}).single('chosen-image'); // Support only single image upload from this field

// Check whether the file is an image
function isFileAllowed(file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  const extensionName = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extensionName){
    return cb(null,true);
  } else {
    cb('This is not an image. We only index images, sorry!');
  }
}

app.get('/', (req, res) => res.render('index'));

const classifyImage = (image, cb) => {
  
  let imageLabels;
  let dominantColors;

  // Use the locally stored image from the upload Multer performs
  const imageToClassify = `./public/images/${image}`;

  // Ask Google Vision what it thinks this is an image of
  imageClient
  .labelDetection(imageToClassify)
  .then(results => {
    imageLabels = results[0].labelAnnotations;

      // Also ask for the dominant colors to use as search attributes
      imageClient
      .imageProperties(imageToClassify)
      .then(results => {
        const properties = results[0].imagePropertiesAnnotation;
        dominantColors = properties.dominantColors.colors;

        // Pass both lists back in the callback
        cb(imageLabels, dominantColors);
      })
      .catch(err => {
        console.error('Error:', err);
      })
  })
  .catch(err => {
    console.error('Error:', err);
  });
};

const addToAlgoliaIndex = (objectData, cb) => {
  index.addObject(objectData, function(err, content) {
    cb(err, content);
  });
}

/*  This is a helper function to convert RGBa to Hex.
    I didn't write this bit, I found it in a JSFiddle,
    so thanks https://jsfiddle.net/user/Mottie/ */
const rgbaToHex = rgba => {
  rgba = rgba.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgba && rgba.length === 4) ? "#" +
    ("0" + parseInt(rgba[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgba[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgba[3],10).toString(16)).slice(-2) : '';
}

app.post('/add', (req, res) => {

  // Outline our data object. This is what we'll add to and then push to Algolia.
  const algoliaData = {
    labels: [],
    upload_date: Date.now()
  };

  uploader(req, res, (err) => {
    if(err){
      res.json({message: err});
    } else {
      if(req.file == undefined){
        res.json({ message: 'Error: No File Selected!' });
      } else {

        classifyImage(req.file.filename, (imageAttributes, imageColors) => {

          // Set the filename
          algoliaData.image_url = `/images/${req.file.filename}`;

          // Pull in the colors from Google Cloud Vision
          algoliaData.colors = imageColors;

          // Select the most dominant color and convert it to a hex value
          algoliaData.most_dominant_color = rgbaToHex(`rgba(${imageColors[0].color.red},${imageColors[0].color.blue}, ${imageColors[0].color.green}, null)`);

          // Loop through the classifcation labels and just retrieve the label and the score
          imageAttributes.forEach(attribute => {
            algoliaData.labels.push({
              classification: attribute.description,
              score: attribute.score
            });
          });
          
          // Add the object we just created to Algolia
          addToAlgoliaIndex(algoliaData, (err, content) => {
            if (err) {
              res.json({
                message: err
              });
            } else {
              res.json({
                message: `Succesfully uploaded!`
              });
            }
          })

        });
      }
    }
  });

})

const port = 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

