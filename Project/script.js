const musicList = [];
for (let i = 1; i <= 20; i++) {
  musicList.push({
    title: `Music ${i}`,
    artist: `Artist ${i}`,
    file: `musics/music${i}.mp3`,
    cover: `musics/picture${i}.jpg`,
    lyrics: `musics/subtitle${i}.txt`,
  });
}

let currentMusicIndex = 0;
let isPlaying = false;
let audio = new Audio(musicList[currentMusicIndex].file);
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
const lyricsContainer = document.getElementById("lyrics");
const playlistsContainer = document.getElementById("playlists");
const playlistPopup = document.getElementById("playlist-popup");
const popupTitle = document.getElementById("popup-title");
const playlistSongs = document.getElementById("playlist-songs");
const playlistModal = document.getElementById("playlist-modal");
const playlistNameInput = document.getElementById("playlist-name");
const songSelection = document.getElementById("song-selection");
const doneBtn = document.getElementById("done");

// Load Music
function loadMusic(index) {
  const music = currentPlaylist.songs[index];
  audio.src = music.file;
  albumArt.src = music.cover;
  musicTitle.textContent = music.title;
  artistName.textContent = music.artist;
  fetch(music.lyrics)
    .then(response => response.text())
    .then(data => {
      lyricsContainer.innerHTML = data.split("\n").map(line => `<p>${line}</p>`).join("");
    });
  updateLikeButton();
}

// Update Like Button
function updateLikeButton() {
  const isFavourite = playlists[1].songs.includes(currentPlaylist.songs[currentMusicIndex]);
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
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Seek Music
function seekMusic() {
  audio.currentTime = (progress.value * audio.duration) / 100;
}

// Next Music
function nextMusic() {
  currentMusicIndex = (currentMusicIndex + 1) % currentPlaylist.songs.length;
  loadMusic(currentMusicIndex);
  if (isPlaying) audio.play();
}

// Previous Music
function prevMusic() {
  currentMusicIndex = (currentMusicIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length;
  loadMusic(currentMusicIndex);
  if (isPlaying) audio.play();
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

// Switch Playlist
function switchPlaylist(playlist) {
  currentPlaylist = playlist;
  currentMusicIndex = 0;
  loadMusic(currentMusicIndex);
}

// Open Playlist Popup
function openPlaylistPopup(playlist) {
  popupTitle.textContent = playlist.name;
  playlistSongs.innerHTML = playlist.songs
    .map((song, index) => `
      <div onclick="playSongFromPopup(${index})">
        <img src="${song.cover}" alt="${song.title}" width="50">
        <span>${song.title}</span>
      </div>
    `)
    .join("");
  playlistPopup.style.display = "flex";
}

// Play Song from Popup
function playSongFromPopup(index) {
  currentMusicIndex = index;
  loadMusic(currentMusicIndex);
  if (isPlaying) audio.play();
  playlistPopup.style.display = "none";
}

// Create Playlist
function createPlaylist() {
  const name = playlistNameInput.value.trim();
  if (!name) return;
  const selectedSongs = Array.from(songSelection.querySelectorAll("input:checked")).map(input => musicList[input.value]);
  playlists.push({ name, songs: selectedSongs });
  renderPlaylists();
  closeModal();
}

// Render Playlists
function renderPlaylists() {
  playlistsContainer.innerHTML = playlists
    .map((playlist, index) => `<li data-playlist="${index}" onclick="openPlaylistPopup(playlists[${index}])">${playlist.name}</li>`)
    .join("");
}

// Open Modal
function openModal() {
  playlistModal.style.display = "flex";
  songSelection.innerHTML = musicList
    .map((music, index) => `<div><input type="checkbox" value="${index}"> ${music.title}</div>`)
    .join("");
}

// Close Modal
function closeModal() {
  playlistModal.style.display = "none";
  playlistPopup.style.display = "none";
}

// Event Listeners
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);
likeBtn.addEventListener("click", likeMusic);
progress.addEventListener("input", seekMusic);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", nextMusic);
document.getElementById("create-playlist").addEventListener("click", openModal);
doneBtn.addEventListener("click", createPlaylist);
document.querySelectorAll(".close").forEach(btn => btn.addEventListener("click", closeModal));

// Load First Music
loadMusic(currentMusicIndex);
renderPlaylists();
