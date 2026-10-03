const audio = document.getElementById('audio');
const seekBar = document.querySelector('.seek-bar');
const songName = document.querySelector('.song-name');
const artistName = document.querySelector('.artist-name');
const coverImg = document.querySelector('.cover-img');
const currentTime = document.querySelector('.current-time');
const songDuration = document.querySelector('.song-duration');

const playBtn = document.querySelector('.play-btn');
const playBtnIcon = playBtn.querySelector('.play-btn-icon');
const forwardBtn = document.querySelector('.forward-btn');
const backwardBtn = document.querySelector('.reverse-btn');

let isSeeking = false;
let currentSongIdx = 0;
let songs = []

async function initApp() {
  try {
    const response = await fetch('db.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
     songs = await response.json();

    if (songs.length > 0) {
      currentSongIdx = 0;
      setMusic(currentSongIdx);
    }
  } catch (error) {
    console.error('Failed to fetch JSON:', error);
  }
}

function setMusic(index) {
  const song = songs[index];
  if (!song) return;
  
  seekBar.value = 0;
  audio.src = song.filePath;
  songName.textContent = song.title;
  artistName.textContent = song.artist;
  coverImg.src = song['cover-img'];

  seekBar.max = song.duration;
  songDuration.textContent = formatDuration(song.duration);
}

function formatDuration(duration) {
  if (isNaN(duration) || duration < 0) return '00:00';
  let min = Math.floor(duration / 60);
  let sec = Math.floor(duration % 60);

  min = min < 10 ? `0${min}` : min;
  sec = sec < 10 ? `0${sec}` : sec; 
  return `${min}:${sec}`;
}

function playSong() {
  audio.play().then(() => {
    playBtn.dataset.active = 'true';
    playBtnIcon.src = './assets/pause.svg';
  }).catch((err) => {
    console.error('Playback failed:', err);
  });
}

function pauseSong() {
  audio.pause();
  playBtn.dataset.active = 'false';
  playBtnIcon.src = './assets/play.svg';
}

// Fetch JSON once on startup
initApp();

// Update seek bar and timer as song plays
audio.addEventListener('timeupdate', () => {
  if (!isSeeking) {
    seekBar.value = audio.currentTime;
    currentTime.textContent = formatDuration(audio.currentTime);
  }
})

// Auto-advance to next song when current track ends
audio.addEventListener('ended', () => {
  forwardBtn.click();
})

// Imeediate feedback while dragging the slider
seekBar.addEventListener('input', () => {
  isSeeking = true;
  currentTime.textContent = formatDuration(seekBar.value);
})

// Commit new seek position when user releases the slider
seekBar.addEventListener('change', () => {
  audio.currentTime = seekBar.value;
  isSeeking = false;
})

// Controls 
playBtn.addEventListener('click', () => {
  const isActive = playBtn.dataset.active === 'true';

  if (isActive) {
    pauseSong();
  } else {
    playSong();
  }
});

forwardBtn.addEventListener('click', () => {
  currentSongIdx = (currentSongIdx + 1) % songs.length;
  setMusic(currentSongIdx);
  playSong();
})

backwardBtn.addEventListener('click', () => {
  currentSongIdx = (currentSongIdx - 1 + songs.length) % songs.length;
  setMusic(currentSongIdx);
  playSong();
})
