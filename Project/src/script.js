const musicList = [];
for (let i = 1; i <= 20; i++) {
  musicList.push({
    title: `Music ${i}`,
    artist: `Artist ${i}`,
    file: `../musics/music${i}.mp3`, // Ensure this path is correct
    cover: `../musics/picture${i}.jpg`, // Ensure this path is correct
    lyrics: `../musics/subtitle${i}.txt`, // Ensure this path is correct
  });
}

let currentMusicIndex = 0;
let isPlaying = false;
let audio = new Audio();
let playlists = [
  { name: "All Music", songs: [...musicList] },
  { name: "Favourites", songs: [] },
];
let currentPlaylist = playlists[0];

// DOM Elements
const albumArt = document.getElementById("album-art");
const musicTitle = document.getElementById("music-title");
const artistName = document.getElementById("artist-name");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const likeBtn = document.getElementById("like");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");
const playlistsContainer = document.getElementById("playlists");
const playlistSidebar = document.getElementById("playlist-sidebar");
const playlistSidebarSongs = document.getElementById("playlist-sidebar-songs");
const createPlaylistSidebar = document.getElementById("create-playlist-sidebar");
const songSelection = document.getElementById("song-selection");
const doneBtn = document.getElementById("done");
const lyricsSection = document.getElementById("lyrics-section");
const lyrics = document.getElementById("lyrics");

// Load Music
function loadMusic(index) {
  const music = currentPlaylist.songs[index];
  audio.src = music.file;
  albumArt.src = music.cover;

  // Fetch and parse lyrics
  fetch(music.lyrics)
    .then((response) => {
      if (!response.ok) throw new Error("Lyrics not found");
      return response.text();
    })
    .then((data) => {
      const lines = data.split("\n");
      const title = lines[0].trim(); // First line is the title
      const artist = lines[1].trim(); // Second line is the artist
      const lyricsText = lines.slice(2).join("<br>"); // Lines from 3 onwards are lyrics

      // Update DOM elements
      musicTitle.textContent = title;
      artistName.textContent = artist;
      lyrics.innerHTML = lyricsText; // Display lyrics in the lyrics section
    })
    .catch((error) => {
      console.error("Error loading lyrics:", error);
      musicTitle.textContent = music.title; // Fallback to default title
      artistName.textContent = music.artist; // Fallback to default artist
      lyrics.innerHTML = "<p>No lyrics available.</p>"; // Fallback for lyrics
    });

  updateLikeButton();
  if (isPlaying) audio.play();
}

// Update Like Button
function updateLikeButton() {
  const isFavourite = playlists[1].songs.includes(
    currentPlaylist.songs[currentMusicIndex]
  );
  likeBtn.classList.toggle("liked", isFavourite);
}

// Play/Pause Music
function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
}

// Update Progress Bar
function updateProgress() {
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
}

// Format Time
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Seek Music
function seekMusic() {
  audio.currentTime = (progress.value * audio.duration) / 100;
}

// Next Music
function nextMusic() {
  currentMusicIndex = (currentMusicIndex + 1) % currentPlaylist.songs.length;
  loadMusic(currentMusicIndex);

  albumArt.src = currentPlaylist.songs[currentMusicIndex].cover;

}

// Previous Music
function prevMusic() {
  currentMusicIndex =
    (currentMusicIndex - 1 + currentPlaylist.songs.length) %
    currentPlaylist.songs.length;
  loadMusic(currentMusicIndex);

  albumArt.src = currentPlaylist.songs[currentMusicIndex].cover;

}

// Like Music
function likeMusic() {
  const song = currentPlaylist.songs[currentMusicIndex];
  const favourites = playlists[1].songs;
  if (favourites.includes(song)) {
    favourites.splice(favourites.indexOf(song), 1);
  } else {
    favourites.push(song);
  }
  updateLikeButton();
}

// Open Playlist Sidebar
function openPlaylistSidebar(playlist) {
  playlistSidebarSongs.innerHTML = playlist.songs
    .map(
      (song, index) => `
      <div onclick="playSongFromSidebar(${index})">
        <img src="${song.cover}" alt="${song.title}" width="50">
        <span>${song.title}</span>
      </div>
    `
    )
    .join("");
  playlistSidebar.classList.add("open");
}

// Close Playlist Sidebar
function closePlaylistSidebar() {
  playlistSidebar.classList.remove("open");
}

// Play Song from Sidebar
function playSongFromSidebar(index) {
  currentMusicIndex = index;
  loadMusic(currentMusicIndex);
  closePlaylistSidebar();
}

// Open Create Playlist Sidebar
function openCreatePlaylistSidebar() {
  songSelection.innerHTML = musicList
    .map(
      (music, index) => `
      <div>
        <input type="checkbox" value="${index}"> ${music.title}
      </div>
    `
    )
    .join("");
  createPlaylistSidebar.classList.add("open");
}

// Close Create Playlist Sidebar
function closeCreatePlaylistSidebar() {
  createPlaylistSidebar.classList.remove("open");
}
const playlistNameInput = document.getElementById("Spotify"); // Ensure the correct ID


// Create Playlist
function createPlaylist() {
  const name = playlistNameInput.value.trim();
  if (!name) return;
  const selectedSongs = Array.from(
    songSelection.querySelectorAll("input:checked")
  ).map((input) => musicList[input.value]);
  playlists.push({ name, songs: selectedSongs });
  renderPlaylists();
  closeCreatePlaylistSidebar();
}

// Render Playlists
function renderPlaylists() {
  playlistsContainer.innerHTML = playlists
    .map(
      (playlist, index) => `
      <li data-playlist="${index}" onclick="openPlaylistSidebar(playlists[${index}])">
        ${playlist.name}
      </li>
    `
    )
    .join("");
}

// Event Listeners
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);
likeBtn.addEventListener("click", likeMusic);
progress.addEventListener("input", seekMusic);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", nextMusic);
document
  .getElementById("create-playlist")
  .addEventListener("click", openCreatePlaylistSidebar);
doneBtn.addEventListener("click", createPlaylist);

// Close sidebar when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".playlist-sidebar") && !event.target.closest(".sidebar")) {
    closePlaylistSidebar();
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const waveContainer = document.querySelector('.sound-wave');

  if (waveContainer) {
    // Generate 20 bars dynamically
    for (let i = 0; i < 30; i++) {
      let span = document.createElement('span');
      span.style.animation = `waveAnimation ${0.5 + Math.random()}s infinite ease-in-out`;
      span.style.animationPlayState = 'paused'; // Start in paused state
      waveContainer.appendChild(span);
    }

    const waveBars = document.querySelectorAll('.sound-wave span');

    // Function to start animation when music plays
    function startWave() {
      waveBars.forEach(bar => {
        bar.style.animationPlayState = "running"; // Start animation
        bar.style.opacity = "1"; // Show waves
      });
    }

    // Function to stop animation when music pauses or ends
    function stopWave() {
      waveBars.forEach(bar => {
        bar.style.animationPlayState = "paused"; // Stop animation
        bar.style.opacity = "0.5"; // Dim waves when paused
      });
    }

    // Attach event listeners to the global `audio` object
    audio.addEventListener('play', startWave);
    audio.addEventListener('pause', stopWave);
    audio.addEventListener('ended', stopWave);
  }
});









// Load First Music
loadMusic(currentMusicIndex);
renderPlaylists();
