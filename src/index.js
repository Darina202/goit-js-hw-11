import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { createGallery } from './js/markup';

const API_KEY = '41017766-9f085fc310f3820f85afb105c';
const formSearch = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

let page = 1;
let inputValue;
loadBtn.hidden = true;

formSearch.addEventListener('submit', searchName);
loadBtn.addEventListener('click', handleLoadMore);

function searchName(event) {
  event.preventDefault();
  const form = event.target;
  inputValue = form.elements.searchQuery.value.trim();

  if (inputValue === '') {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  page = 1;
  fetchImage(inputValue, page)
    .then(data => {
      if (data.hits && data.hits.length > 0) {
        gallery.innerHTML = createGallery(data);
        Notify.info(`Hooray! We found ${data.totalHits} images.`);
        loadBtn.hidden = false;
      } else {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    })
    .catch(err => {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      console.log(err);
    });
}

async function fetchImage(inputValue, page = 1) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: API_KEY,
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: 40,
  });
  return await axios.get(`${BASE_URL}?${params}`).then(({ data }) => data);
}

function handleLoadMore() {
  page += 1;
  loadBtn.disabled = true;
  fetchImage(inputValue, page)
    .then(data => {
      if (data.hits.length === 0 || data.page * 40 >= data.totalHits) {
        loadBtn.hidden = true;
        loadBtn.removeEventListener('click', handleLoadMore);
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        formSearch.reset();
        return;
      }
      gallery.insertAdjacentHTML('beforeend', createGallery(data));
      loadBtn.disabled = false;
    })
    .catch(err => {
      console.log(err);
    });
}
