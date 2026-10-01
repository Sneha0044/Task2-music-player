const tracks = [
  { title: 'Golden Hour', artist: 'SoundHelix Demo', file: 'SoundHelix-Song-1.mp3' },
  { title: 'Window Seat', artist: 'SoundHelix Demo', file: 'SoundHelix-Song-2.mp3' },
  { title: 'Soft Landing', artist: 'SoundHelix Demo', file: 'SoundHelix-Song-3.mp3' },
].map((track) => ({ ...track, src: `https://www.soundhelix.com/examples/mp3/${track.file}` }));

const audio = document.querySelector('#audio');
const playButton = document.querySelector('#play');
const seek = document.querySelector('#seek');
const volume = document.querySelector('#volume');
const title = document.querySelector('.track-title');
const artist = document.querySelector('.track-artist');
const elapsed = document.querySelector('.elapsed-time');
const duration = document.querySelector('.duration-time');
const status = document.querySelector('.player-status');
const playlistButtons = [...document.querySelectorAll('.playlist-track')];
const autoplayButton = document.querySelector('.autoplay-button');
let currentIndex = 0;
let shuffleEnabled = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function paintProgress() {
  const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  seek.value = String(Math.round(progress * 10));
  seek.style.background = `linear-gradient(to right,var(--olive) 0%,var(--olive) ${progress}%,#d2d0c7 ${progress}%,#d2d0c7 100%)`;
  elapsed.textContent = formatTime(audio.currentTime);
}

function selectTrack(index, shouldPlay = false) {
  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];
  audio.pause();
  audio.src = track.src;
  audio.load();
  title.textContent = track.title;
  artist.textContent = track.artist;
  duration.textContent = '0:00';
  elapsed.textContent = '0:00';
  seek.value = '0';
  paintProgress();
  playlistButtons.forEach((button, buttonIndex) => {
    const isCurrent = buttonIndex === currentIndex;
    button.classList.toggle('is-current', isCurrent);
    if (isCurrent) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  document.querySelector('.track-index').textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
  status.textContent = '';
  if (shouldPlay) startPlayback();
}

async function startPlayback() {
  try {
    await audio.play();
    playButton.textContent = 'Ⅱ';
    playButton.setAttribute('aria-label', 'Pause');
    document.querySelector('.player-main').classList.add('is-playing');
    status.textContent = '';
  } catch {
    status.textContent = 'Could not load this demo track. Check your internet connection and try again.';
  }
}

function pausePlayback() {
  audio.pause();
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Play');
  document.querySelector('.player-main').classList.remove('is-playing');
}

function nextTrack() {
  if (shuffleEnabled && tracks.length > 1) {
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * tracks.length);
    selectTrack(nextIndex, true);
    return;
  }
  selectTrack(currentIndex + 1, true);
}

playButton.addEventListener('click', () => {
  if (audio.paused) startPlayback();
  else pausePlayback();
});

document.querySelector('#next').addEventListener('click', nextTrack);
document.querySelector('#previous').addEventListener('click', () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  selectTrack(currentIndex - 1, true);
});

playlistButtons.forEach((button) => {
  button.addEventListener('click', () => selectTrack(Number(button.dataset.track), true));
});

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
  document.querySelector(`[data-duration="${currentIndex}"]`).textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', paintProgress);
audio.addEventListener('play', () => {
  playButton.textContent = 'Ⅱ';
  playButton.setAttribute('aria-label', 'Pause');
  document.querySelector('.player-main').classList.add('is-playing');
});
audio.addEventListener('pause', pausePlayback);
audio.addEventListener('ended', () => {
  if (autoplayButton.getAttribute('aria-pressed') === 'true') nextTrack();
  else pausePlayback();
});
audio.addEventListener('error', () => {
  status.textContent = 'This sample audio is unavailable right now. Try another track or check your connection.';
  pausePlayback();
});

seek.addEventListener('input', () => {
  if (!Number.isFinite(audio.duration)) return;
  audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
  paintProgress();
});
volume.addEventListener('input', () => {
  audio.volume = Number(volume.value) / 100;
  audio.muted = audio.volume === 0;
});
audio.volume = Number(volume.value) / 100;

autoplayButton.addEventListener('click', () => {
  const enabled = autoplayButton.getAttribute('aria-pressed') !== 'true';
  autoplayButton.setAttribute('aria-pressed', String(enabled));
});

const shuffleButton = document.querySelector('.shuffle-button');
shuffleButton.addEventListener('click', () => {
  shuffleEnabled = !shuffleEnabled;
  shuffleButton.setAttribute('aria-pressed', String(shuffleEnabled));
});

const repeatButton = document.querySelector('.repeat-button');
repeatButton.addEventListener('click', () => {
  audio.loop = !audio.loop;
  repeatButton.setAttribute('aria-pressed', String(audio.loop));
});

const likeButton = document.querySelector('.like-button');
likeButton.addEventListener('click', () => {
  const liked = likeButton.getAttribute('aria-pressed') !== 'true';
  likeButton.setAttribute('aria-pressed', String(liked));
  likeButton.textContent = liked ? '♥' : '♡';
});

selectTrack(0);
