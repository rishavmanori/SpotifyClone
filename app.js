let currentSong = new Audio();
var currentMusic = null;
let songs;
let currFolder;
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currFolder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".flac")) {
      songs.push(
        element.href
          .replace(/%20/g, " ")
          .split(`/${currFolder}/`)[1]
          .split(".")[0]
      );
    }
  }
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li>
      <img src="images/${song.split("-")[0]}.jpeg" />
      <div class="info">
        <div class="sname">${song.split("-")[0].replace(/%20/g, " ")}</div>
        <div class="sartist">${song.split("-")[1].replace(/%20/g, " ")}</div>
      </div>
    </li>`;
  }
  //Attach event listener to songs
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e);
    });
  });
}
//function to covert seconds to m:ss format
function secondsToMSS(seconds) {
  // Calculate minutes and remaining seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Return formatted time string
  return minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
}

//play music
const playMusic = (track) => {
  currentSong.src = `${currFolder}/${track.querySelector(".sname").innerHTML}-${
    track.querySelector(".sartist").innerHTML
  }.flac`;
  currentSong.play();
  if (currentMusic) {
    currentMusic.classList.remove("bgchange");
  }
  currentMusic = track;
  currentMusic.classList.add("bgchange");
  var songInfo = document.querySelector(".song-info");
  songInfo.style.visibility = "visible";
  play.querySelector("img").src = "images/pause.svg";
  document.querySelector(".song-info").firstElementChild.src = `images/${
    track.querySelector(".sname").innerHTML
  }.jpeg`;
  document.querySelector(".song-info").querySelector(".name").innerHTML =
    track.querySelector(".sname").innerHTML;
  document.querySelector(".song-info").querySelector(".artist").innerHTML =
    track.querySelector(".sartist").innerHTML;
  document.querySelector(".song-duration").innerHTML = currentSong.duration;
};

async function displayArtists() {
  let a = await fetch(`http://127.0.0.1:5500/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let li = div.getElementsByTagName("li");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(li);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.getElementsByTagName("a")[0].href.includes("/Songs/")) {
      let folder = e.firstChild.title;
      let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `<div data-folder="${response.title}" class="card rounded">
      <div class="play-btn">
        <img src="images/play.svg" alt="" />
      </div>
      <img class="cover"src="${response.image}" alt="" />
      <div class="card-info">
        <h2>${response.title}</h2>
      </div>
    </div>`;
    }
  }
  //adding event listener to cards
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(
        `Songs/${item.target.parentElement.dataset.folder}`
      );
      // console.log(item.target.parentElement.dataset.folder);
    });
  });
}

async function main() {
  //Get list of all songs
  songs = await getSongs("Songs");
  //show all songs in playlist
  displayArtists();

  //play & pause music
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.querySelector("img").src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.querySelector("img").src = "images/play.svg";
    }
  });
  //add event listener to previous button
  prev.addEventListener("click", () => {
    let songName = decodeURI(
      currentSong.src.split("/")[6].split(".f")[0].split("-")[0]
    );
    let liElements = document.querySelectorAll(".songList li");
    for (li of liElements) {
      if (
        li.querySelector(".sname").innerHTML === songName &&
        li.querySelector(".sname").parentElement.parentElement
          .previousSibling !== null
      ) {
        playMusic(
          li.querySelector(".sname").parentElement.parentElement.previousSibling
        );
      }
    }
  });

  //add event listener to next button
  next.addEventListener("click", () => {
    let songName = decodeURI(
      currentSong.src.split("/")[6].split(".")[0].split("-")[0]
    );
    let liElements = document.querySelectorAll(".songList li");
    for (li of liElements) {
      if (
        li.querySelector(".sname").innerHTML === songName &&
        li.querySelector(".sname").parentElement.parentElement.nextSibling !==
          null
      ) {
        playMusic(
          li.querySelector(".sname").parentElement.parentElement.nextSibling
        );
      }
    }
  });

  //time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-duration").innerHTML = secondsToMSS(
      currentSong.duration
    );
    document.querySelector(".song-time").innerHTML = secondsToMSS(
      currentSong.currentTime
    );
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //adding event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (percent / 100) * currentSong.duration;
  });

  //adding event listener to volume button
  document
    .querySelector(".slider")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}
main();
