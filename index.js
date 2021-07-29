const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let viewMode = 'Gallery'
let page = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const galleryIcon = document.querySelector('#icon-gallery')
const listIcon = document.querySelector('#icon-list')

function renderMovieCard(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie posters" class="img-fluid">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-id="${item.id}"
                data-target="#movie-modal">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div >
    </div >`
  });

  dataPanel.innerHTML = rawHTML
}

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `
    <div class="m-3 col-12 justify-content-center align-items-center">
      <div class="row" id="movieBox">
        <h5 class="card-title col-8 mt-4 pt-2">${item.title}</h5>
          <div class="col-4 mt-4">
            <button type="submit" 
            class="btn btn-primary btn-show-movie"
            data-toggle="modal"
            data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button type="submit" 
            class= "btn btn-info  btn-add-favorite" 
            data-id="${item.id}">+</button> 
          </div>
      </div>
    </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 0; page < numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">${page + 1}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img
            src="${POSTER_URL + data.image}"
            class="card-img-top" alt="Movie posters" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function judgeViewMode(page) {
  if (viewMode == 'Gallery') {
    renderMovieCard(getMoviesByPage(page))
  } else if (viewMode == 'List') {
    renderMovieList(getMoviesByPage(page))
  }
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

listIcon.addEventListener('click', function onListIconClicked(event) {
  renderMovieList(getMoviesByPage(page))
  viewMode = 'List'
})

galleryIcon.addEventListener('click', function onGalleryClicked(event) {
  renderMovieCard(getMoviesByPage(page))
  viewMode = 'Gallery'
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  judgeViewMode(page)
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with keyword:', keyword)
  }
  page = 1

  renderPaginator(filteredMovies.length)
  judgeViewMode(page)
})

axios.get(INDEX_URL).then((response) => {
  // Array(80)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieCard(getMoviesByPage(1))
})