document.addEventListener('DOMContentLoaded', function () {
  const playlistElement = document.getElementById('playlist');
  const trackImage = document.getElementById('track-image');
  const trackName = document.getElementById('track-name');
  const artistName = document.getElementById('artist-name');
  const playPauseBtn = document.getElementById('play-pause');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const shuffleBtn = document.getElementById('shuffle');
  const repeatBtn = document.getElementById('repeat');
  const progress = document.getElementById('progress');
  const lyricsDisplay = document.getElementById('lyrics');
  const likeBtn = document.getElementById('like-btn');
  const currentTimeDisplay = document.getElementById('current-time');
  const totalTimeDisplay = document.getElementById('total-time');
  const homeBtn = document.getElementById('home-btn');
  const favoritesBtn = document.getElementById('favorites-btn');

  let tracks = [];
  let currentTrackIndex = 0;
  let audio = new Audio();
  let isShuffle = false;
  let isRepeat = false;
  let favorites = [];

  // Load tracks from the musics folder
  for (let i = 1; i <= 20; i++) {
    tracks.push({
      name: `Music ${i}`,
      url: `musics/music${i}.mp3`,
      image: `musics/picture${i}.jpg`,
      lyrics: `musics/subtitle${i}.txt`,
      isLiked: false, // Track like status
    });
  }

  // Display playlist
  function displayPlaylist(filteredTracks = tracks) {
    playlistElement.innerHTML = filteredTracks.map((track, index) => `
            <div class="track" data-index="${tracks.indexOf(track)}">
                <img src="${track.image}" alt="${track.name}">
                <p>${track.name}</p>
            </div>
        `).join('');
    playlistElement.querySelectorAll('.track').forEach(track => {
      track.addEventListener('click', function () {
        currentTrackIndex = parseInt(this.getAttribute('data-index'));
        playTrack(currentTrackIndex);
      });
    });
  }

  // Play track
  function playTrack(index) {
    if (index >= 0 && index < tracks.length) {
      audio.src = tracks[index].url;
      audio.play();
      trackImage.src = tracks[index].image;
      trackName.textContent = tracks[index].name;
      artistName.textContent = "Artist";
      playPauseBtn.textContent = '❚❚';
      fetchLyrics(tracks[index].lyrics);
      updateLikeButton(tracks[index].isLiked);
    }
  }

  // Fetch lyrics
  function fetchLyrics(lyricsUrl) {
    fetch(lyricsUrl)
      .then(response => response.text())
      .then(text => {
        lyricsDisplay.textContent = text;
      })
      .catch(() => {
        lyricsDisplay.textContent = 'No lyrics available for this track.';
      });
  }

  // Update like button state
  function updateLikeButton(isLiked) {
    likeBtn.classList.toggle('selected', isLiked);
  }

  // Like button functionality
  likeBtn.addEventListener('click', function () {
    const currentTrack = tracks[currentTrackIndex];
    currentTrack.isLiked = !currentTrack.isLiked;
    updateLikeButton(currentTrack.isLiked);

    if (currentTrack.isLiked) {
      favorites.push(currentTrack);
    } else {
      favorites = favorites.filter(track => track !== currentTrack);
    }
  });

  // Home button functionality
  homeBtn.addEventListener('click', function () {
    displayPlaylist();
    homeBtn.classList.add('active');
    favoritesBtn.classList.remove('active');
  });

  // Favorites button functionality
  favoritesBtn.addEventListener('click', function () {
    displayPlaylist(favorites);
    favoritesBtn.classList.add('active');
    homeBtn.classList.remove('active');
  });

  // Play/Pause button
  playPauseBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play();
      this.textContent = '❚❚';
    } else {
      audio.pause();
      this.textContent = '►';
    }
  });

  // Next track
  nextBtn.addEventListener('click', function () {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(currentTrackIndex);
  });

  // Previous track
  prevBtn.addEventListener('click', function () {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(currentTrackIndex);
  });

  // Shuffle button
  shuffleBtn.addEventListener('click', function () {
    isShuffle = !isShuffle;
    this.style.backgroundColor = isShuffle ? '#4CAF50' : '';
  });

  // Repeat button
  repeatBtn.addEventListener('click', function () {
    isRepeat = !isRepeat;
    this.style.backgroundColor = isRepeat ? '#4CAF50' : '';
  });

  // Update progress and time display
  audio.addEventListener('timeupdate', function () {
    const currentTime = formatTime(audio.currentTime);
    const totalTime = formatTime(audio.duration);
    currentTimeDisplay.textContent = currentTime;
    totalTimeDisplay.textContent = totalTime;
    progress.value = (audio.currentTime / audio.duration) * 100;
  });

  // Seek functionality
  progress.addEventListener('input', function () {
    audio.currentTime = (progress.value / 100) * audio.duration;
  });

  // Format time (MM:SS)
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Initialize
  displayPlaylist();
  playTrack(0);
});
