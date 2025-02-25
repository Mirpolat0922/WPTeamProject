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

// Shuffle and Repeat State
let isShuffled = false;
let repeatMode = "off"; // Can be "off", "one", or "all"

// DOM Elements
const albumArt = document.getElementById("album-art");
const musicTitle = document.getElementById("music-title");
const artistName = document.getElementById("artist-name");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const likeBtn = document.getElementById("like");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
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

// Next Music Function
function nextMusic() {
  if (repeatMode === "all" && currentMusicIndex === currentPlaylist.songs.length - 1) {
    // If it's the last song and repeatMode is "all", loop back to the first song
    currentMusicIndex = 0;
  } else {
    // Otherwise, go to the next song
    currentMusicIndex = (currentMusicIndex + 1) % currentPlaylist.songs.length;
  }
  loadMusic(currentMusicIndex); // Load and play the new song
}

// Previous Music
function prevMusic() {
  currentMusicIndex =
    (currentMusicIndex - 1 + currentPlaylist.songs.length) %
    currentPlaylist.songs.length;
  loadMusic(currentMusicIndex);
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

// Shuffle Playlist
function shufflePlaylist() {
  if (isShuffled) {
    // Restore original order
    currentPlaylist.songs = [...musicList];
    isShuffled = false;
    shuffleBtn.classList.remove("active");
  } else {
    // Shuffle the playlist
    const shuffledSongs = [...currentPlaylist.songs];
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
    }
    currentPlaylist.songs = shuffledSongs;
    isShuffled = true;
    shuffleBtn.classList.add("active");
  }
  currentMusicIndex = 0; // Start from the first song
  loadMusic(currentMusicIndex);
}

// Toggle Repeat Mode
function toggleRepeatMode() {
  switch (repeatMode) {
    case "off":
      repeatMode = "one";
      repeatBtn.classList.add("active");
      repeatBtn.innerHTML = '<i class="fas fa-redo"></i> <small>1</small>';
      break;
    case "one":
      repeatMode = "all";
      repeatBtn.innerHTML = '<i class="fas fa-redo"></i> <small>∞</small>';
      break;
    case "all":
      repeatMode = "off";
      repeatBtn.classList.remove("active");
      repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
      break;
  }
}

// Handle End of Song
audio.addEventListener("ended", () => {
  if (repeatMode === "one") {
    // Repeat the current song
    audio.currentTime = 0; // Reset to the beginning
    audio.play(); // Play again
    currentMusicIndex = currentMusicIndex - 1;
  } else if (repeatMode === "all") {
    // Continue to the next song in the playlist
    //nextMusic();
  } else if (repeatMode === "off") {
    // Stop playing if it's the last song
    if (currentMusicIndex === currentPlaylist.songs.length - 1) {
      isPlaying = false;
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      // Play the next song
      nextMusic();
    }
  }
});

// Delete Playlist
function deletePlaylist(index) {
  if (index < 2) return; // Prevent deleting "All Music" and "Favourites"
  playlists.splice(index, 1); // Remove the playlist
  renderPlaylists(); // Re-render the playlists
}

// Render Playlists
function renderPlaylists() {
  playlistsContainer.innerHTML = playlists
    .map((playlist, index) => {
      // Don't add delete button for "All Music" and "Favourites"
      const deleteButton =
        playlist.name !== "All Music" && playlist.name !== "Favourites"
          ? `<button class="delete-playlist" onclick="deletePlaylist(${index})">Delete</button>`
          : "";
      return `
        <li data-playlist="${index}" onclick="openPlaylistSidebar(playlists[${index}])">
          ${playlist.name}
          ${deleteButton}
        </li>
      `;
    })
    .join("");
}

// Open Playlist Sidebar
async function openPlaylistSidebar(playlist) {
  currentPlaylist = playlist; // Set the current playlist
  playlistSidebarSongs.innerHTML = "";

  for (let i = 0; i < playlist.songs.length; i++) {
    const song = playlist.songs[i];
    try {
      // Fetch the lyrics file
      const response = await fetch(song.lyrics);
      if (!response.ok) throw new Error("Lyrics not found");

      // Read the first line of the lyrics file
      const data = await response.text();
      const firstLine = data.split("\n")[0].trim(); // First line is the music name

      // Add the song to the sidebar
      playlistSidebarSongs.innerHTML += `
        <div onclick="playSongFromSidebar(${i})">
          <img src="${song.cover}" alt="${firstLine}" width="50">
          <span>${firstLine}</span>
        </div>
      `;
    } catch (error) {
      console.error("Error loading lyrics:", error);
      // Fallback to default title if lyrics file is not found
      playlistSidebarSongs.innerHTML += `
        <div onclick="playSongFromSidebar(${i})">
          <img src="${song.cover}" alt="${song.title}" width="50">
          <span>${song.title}</span>
        </div>
      `;
    }
  }

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
async function openCreatePlaylistSidebar() {
  songSelection.innerHTML = "";

  for (let i = 0; i < musicList.length; i++) {
    const music = musicList[i];
    try {
      // Fetch the lyrics file
      const response = await fetch(music.lyrics);
      if (!response.ok) throw new Error("Lyrics not found");

      // Read the first line of the lyrics file
      const data = await response.text();
      const firstLine = data.split("\n")[0].trim(); // First line is the music name

      // Add the song to the selection list
      songSelection.innerHTML += `
        <div>
          <input type="checkbox" value="${i}"> ${firstLine}
        </div>
      `;
    } catch (error) {
      console.error("Error loading lyrics:", error);
      // Fallback to default title if lyrics file is not found
      songSelection.innerHTML += `
        <div>
          <input type="checkbox" value="${i}"> ${music.title}
        </div>
      `;
    }
  }

  createPlaylistSidebar.classList.add("open");
}

// Close Create Playlist Sidebar
function closeCreatePlaylistSidebar() {
  createPlaylistSidebar.classList.remove("open");
}

// Create Playlist
function createPlaylist() {
  const playlistNameInput = document.getElementById("playlist-name"); // Add this line
  const name = playlistNameInput.value.trim();
  if (!name) return;

  // Get selected songs
  const selectedSongs = Array.from(
    songSelection.querySelectorAll("input:checked")
  ).map((input) => musicList[input.value]);

  // Add the new playlist
  playlists.push({ name, songs: selectedSongs });

  // Render the updated playlists
  renderPlaylists();

  // Close the create playlist sidebar
  closeCreatePlaylistSidebar();
}

// Event Listeners
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);
likeBtn.addEventListener("click", likeMusic);
shuffleBtn.addEventListener("click", shufflePlaylist);
repeatBtn.addEventListener("click", toggleRepeatMode);
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
    // Generate 30 bars dynamically
    for (let i = 0; i < 30; i++) {
      let span = document.createElement('span');
      span.style.animation = `waveAnimation ${0.5 + Math.random()}s infinite ease-in-out`;
      span.style.animationPlayState = 'paused'; // Start in paused state
      waveContainer.appendChild(span);
    }

    const waveBars = document.querySelectorAll('.sound-wave span');

    // Function to start animation when music plays
    function startWave() {
      console.log("Music started, wave animation running...");
      waveBars.forEach(bar => {
        bar.style.animationPlayState = "running"; // Start animation
        bar.style.opacity = "1"; // Show waves
      });
    }

    // Function to stop animation when music pauses or ends
    function stopWave() {
      console.log("Music stopped, wave animation paused...");
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
