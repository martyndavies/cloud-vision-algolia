// Find the modal element and set M.Modal on it
const modalElem = document.querySelector('.modal');
const modalInstance = M.Modal.init(modalElem, {
  dismissible: true
});

// Progress bar init, and hide
const progressBar = document.querySelector('.progress');
progressBar.style.display = 'none';

// Upload button
const uploadButton = document.getElementById('upload-button');

// Upload the chosen image
function uploadImage(){
  const uploadForm = document.getElementById('upload-form');
  var formData = new FormData(uploadForm);
  uploadForm.addEventListener('submit', e => {
    e.preventDefault();
    fetch('/add', {
      body: formData,
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        M.toast({html: `${data.message}`, displayLength: 4000});
        modalInstance.close();
        progressBar.style.display = 'none';
        search.refresh();
      } else {
        progressBar.style.display = 'none';
        M.toast({
          html: 'Hmm, looks like something went wrong. Try again?',
          displayLength: 4000,
          classes: 'red-toast'
        });    
      }
    });
  })
}


uploadButton.addEventListener('click', e => {
  uploadImage();
  progressBar.style.display = 'block'
});

const search = instantsearch({
  appId: 'CJFOM1IQCB',
  apiKey: '28cf1d04351af30106b2619a97749040',
  indexName: 'imagebox',
  urlSync: true
});

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    cssClasses: {
      root: 'row',
      item: ['col', 's3', 'm3']
    },
    templates: {
      empty: `<i class="large material-icons">warning</i><p>Sorry, we couldn't find any matches.`,
      item: function(hit) {
        return `
        <div class="card">
          <div class="card-image">
            <img src="${hit.image_url}" class="image">
          </div>

          <div class="card-action">
            <a href="${hit.image_url}" download="${hit.image_url}">Download</a>
          </div>
          <div class="card-footer" style="height:10px; background-color:${hit.most_dominant_color}"></div>
        </div>
      `
      }
    }
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search our vast array of images',
    autofocus: true,
    poweredBy: true,
    reset: true,
    loadingIndicator: false,
    wrapInput: false
  })
);
  
search.start();