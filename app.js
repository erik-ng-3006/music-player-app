/*
  Things todo:

  - render playlists
  - add current music
  - play /pause music
	- hide current song thumbnail when slide down
  - next / back buttons
  - replay buttons
  - radom buttons
  - progress bar
  - rotate thumbs pic
	- select music inside playlist

*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player');

const playlist = $('.playlist');
const heading = $('h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const toggleButton = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const progressBar = $('#progress');

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isLoop: false,
	configs: JSON.parse(localStorage.getItem('configs')) || {},
	setConfig(key, value) {
		this.configs[key] = value;
		localStorage.setItem('configs', JSON.stringify(this.configs));
	},
	loadConfigs() {
		this.isRandom = this.configs.isRandom;
		this.isLoop = this.configs.isRepeat;
		audio.loop = this.configs.isRepeat;
	},
	songs: [
		{
			name: 'Vancouver',
			singer: 'Big Naughty',
			path: './assets/music/vancouver.mp3',
			image: './assets/img/song1-vancouver.png',
		},
		{
			name: 'Love, Maybe',
			singer: 'MeloMance',
			path: './assets/music/love-maybe.mp3',
			image: './assets/img/song2-love-maybe.png',
		},
		{
			name: 'Christmas tree',
			singer: 'V',
			path: './assets/music/christmas-tree.mp3',
			image: './assets/img/song3-christmas-tree.png',
		},
		{
			name: 'Ohayo my night',
			singer: 'D-Hack',
			path: './assets/music/ohayo-my-night.mp3',
			image: './assets/img/song4-ohayo-my-night.png',
		},
		{
			name: 'Still life',
			singer: 'BigBang',
			path: './assets/music/still-life.mp3',
			image: './assets/img/song5-still-life.png',
		},
		{
			name: 'Meeting is easy, parting is hard',
			singer: 'Leellamarz',
			path: './assets/music/meeting-is-easy.mp3',
			image: './assets/img/song6-meeting-is-easy.png',
		},
		{
			name: 'Beyond Love',
			singer: 'Big Naughty',
			path: './assets/music/beyond-love.mp3',
			image: './assets/img/song7-beyond-love.png',
		},
	],
	defineProperties() {
		Object.defineProperty(this, 'currentSong', {
			get() {
				return this.songs[this.currentIndex];
			},
		});
	},
	handlerEvents() {
		const _this = this;
		const cdWidth = cd.offsetWidth;

		// Rotate the thumb when the music is playing
		const cdThumbAnimation = cdThumb.animate(
			{
				transform: 'rotate(360deg)',
			},
			{
				duration: 10000,
				iterations: Infinity,
			}
		);
		cdThumbAnimation.pause();

		// Change the size of the current song thumbnail when slide down
		document.onscroll = function () {
			const scrollTop = document.documentElement.scrollTop;
			const newCdWidth = cdWidth - scrollTop;

			if (newCdWidth > 0) {
				cd.style.width = newCdWidth + 'px';
				cd.style.opacity = newCdWidth / cdWidth;
			} else {
				cd.style.width = 0;
			}
		};

		// Play music function
		document.onkeyup = function (e) {
			if (e.key == ' ') {
				if (_this.isPlaying) {
					audio.pause();
					cdThumbAnimation.pause();
				} else {
					audio.play();
					cdThumbAnimation.play();
				}
			}
		};

		toggleButton.onclick = function () {
			if (_this.isPlaying) {
				audio.pause();
				cdThumbAnimation.pause();
			} else {
				audio.play();
				cdThumbAnimation.play();
			}
		};
		audio.onplay = function () {
			_this.isPlaying = true;
			player.classList.add('playing');
		};
		audio.onpause = function () {
			_this.isPlaying = false;
			player.classList.remove('playing');
		};
		//Go to next song when current song ended
		audio.onended = function () {
			if (!_this.isLoop) {
				_this.nextSong();
				console.log('ended');
				_this.render();
			}
		};
		//change progress bar while seeking
		progressBar.onchange = function () {
			audio.currentTime = (progressBar.value / 100) * audio.duration;
		};

		//change progress bar base on music duration
		audio.ontimeupdate = function () {
			progressBar.value = Math.floor(
				(audio.currentTime / audio.duration) * 100
			);
		};
		//Select and go to the song inside of the playlist
		playlist.onclick = function (e) {
			const songElement = e.target.closest('.song:not(.active)');
			if (songElement /* || e.target.closest('.option') */) {
				_this.currentIndex = +songElement.dataset.index;
				_this.setCurrentSong();
				audio.play();
				_this.render();
			}
		};

		//control buttons
		nextBtn.onclick = function () {
			_this.nextSong();
			_this.scrollToActiveSong();
			_this.render();
		};

		prevBtn.onclick = function () {
			_this.prevSong();
			_this.scrollToActiveSong();
			_this.render();
		};

		repeatBtn.onclick = function () {
			_this.repeatSong();
		};

		randomBtn.onclick = function () {
			_this.randomSong();
		};
	},
	setCurrentSong() {
		heading.innerText = this.currentSong.name;
		cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
		audio.attributes.src.value = `${this.currentSong.path}`;
	},
	scrollToActiveSong() {
		setTimeout(() => {
			$('.song.active').scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest',
			});
		}, 200);
	},
	nextSong() {
		if (!this.isRandom) {
			this.currentIndex++;
			if (this.currentIndex > this.songs.length - 1) {
				this.currentIndex = 0;
			}
			this.setCurrentSong();
			audio.play();
		} else {
			let randIndex;
			do {
				randIndex = this.getRandomIndex();
			} while (randIndex == this.currentIndex);
			this.currentIndex = randIndex;
			this.setCurrentSong();
			audio.play();
		}
	},
	prevSong() {
		if (!this.isRandom) {
			this.currentIndex--;
			if (this.currentIndex < 0) {
				this.currentIndex = this.songs.length - 1;
			}
			this.setCurrentSong();
			audio.play();
		} else {
			let randIndex;
			do {
				randIndex = this.getRandomIndex();
			} while (randIndex == this.currentIndex);
			this.currentIndex = randIndex;
			this.setCurrentSong();
			audio.play();
		}
	},
	randomSong() {
		this.isRandom = !this.isRandom;
		randomBtn.classList.toggle('active', this.isRandom);
		this.setConfig('isRandom', this.isRandom);
	},
	getRandomIndex() {
		return Math.floor(Math.random() * this.songs.length);
	},
	repeatSong() {
		audio.loop = !audio.loop;
		this.isLoop = !this.isLoop;
		repeatBtn.classList.toggle('active', this.isLoop);
		this.setConfig('isRepeat', this.isLoop);
		console.log(audio.loop);
	},
	render() {
		const songsHtml = this.songs
			.map((song, index) => {
				return `
				<div class="song ${
					index == this.currentIndex ? 'active' : ''
				}" data-index=${index}>
					<div class="thumb" style="background-image: url('${song.image}');"></div>
					<div class="body">
						<h3 class="title">${song.name}</h3>
						<p class="author">${song.singer}</p>
					</div>
					<div class="option">
						<i class="fas fa-ellipsis-h"></i>
					</div>
				</div>`;
			})
			.join('');
		playlist.innerHTML = songsHtml;
	},
	start() {
		Object.keys(this.configs).length > 0 && this.loadConfigs();
		this.render();
		this.defineProperties();
		this.handlerEvents();
		this.setCurrentSong();

		// set state of the buttons base on configs
		repeatBtn.classList.toggle('active', this.isLoop);
		randomBtn.classList.toggle('active', this.isRandom);
	},
};

app.start();
