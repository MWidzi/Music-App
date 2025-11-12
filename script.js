var currentTime = 0;
var songs;

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function generateRandomGradient() {
  // Generate random angle for linear gradient
  const angle = `${Math.floor(Math.random() * 360)}deg`;
  
  // Generate 2-4 random colors
  const colorCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 colors
  const colors = [];
  
  for(let i = 0; i < colorCount; i++) {
      colors.push(getRandomColor());
  }
  
  // Create gradient stops with random positions
  const colorStops = colors.map((color, index) => {
      const position = index === 0 ? 0 : 
                      index === colors.length - 1 ? 100 : 
                      Math.floor(Math.random() * 80 + 10);
      return `${color} ${position}%`;
  }).join(', ');
  
  // Build gradient string
  const gradient = `linear-gradient(${angle}, ${colorStops})`;
  
  return gradient;
}

function getRandomColor() {
  // Generate random hex color
  const letters = '0123456789ABCDEF';
  let color = '#';
  for(let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function formatSeconds(seconds) {
  // Ensure the input is a non-negative integer
  if (seconds < 0) {
      throw new Error("Input must be a non-negative integer.");
  }

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format minutes and seconds to always have two digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

$(document).ready(function(){
  var _GET = getUrlVars();
  var clicked = false;
  var selected;
  var tracksResetCounter;
  var selectedSong;
  var SongBarInterval;
  var genres = [];
  var genresCount = 0;
  var genreSongLengths = [];
  var genreMode = false;
  var lastClickedTrackIndex;
  
  //fetch songs
  fetch('./songs.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  
    })
    .then(data => {
      songs = data; // Save data to the variable
    })
    .catch(error => console.error('Failed to fetch data:', error)); 

  function loadAlbums(){
      var albumIdsFiltered = [];
      var aifLength = 0;
      
      //filters logic
      if(_GET["searched"] !== undefined)
      {
        //readd the text to the search bar so it isn't lost
        $(".searchBar").val(_GET["searched"])

        //check which album names contain searched phrase and add their ids to the array 
        for(let i = 0; i < songs.length; i++)
        {
          if(songs[i]["albumName"].includes(_GET["searched"]))
          {
            albumIdsFiltered[aifLength] = i;
            aifLength++;
          }
        }

        //load the correct albums
        for(let i = 0; i < aifLength; i++)
        {
          $(".bigAlbumContainer").eq(i).css("opacity", "100");
          $(".albumCoverImage").eq(i).attr("src", "./albumCovers/" + songs[albumIdsFiltered[i]]["albumCover"]);
          $(".albumName").eq(i).text(songs[albumIdsFiltered[i]]["albumName"]);
        }
      }
      else
      {
        for(let i = 0; i < songs.length; i++)
        {
          $(".bigAlbumContainer").eq(i).css("opacity", "100");
          $(".albumCoverImage").eq(i).attr("src", "./albumCovers/" + songs[i]["albumCover"]);
          $(".albumName").eq(i).text(songs[i]["albumName"]);
        }
      }
    };

  function loadGenres(){
    //compile possible genres from songs.jsonł
    for(let i = 0; i < songs.length; i++)
    {
      for(let j = 0; j < songs[i]["songs"].length; j++)
      {
        if(jQuery.inArray(songs[i]["songs"][j]["genre"], genres) === -1)
        {
          genresCount++;
          genres.push(songs[i]["songs"][j]["genre"]);
        }
      }
    }

    for(let i = 0; i < genresCount; i++)
    {
      $(".bigGenreContainer").eq(i).css("display", "flex");
      $(".genreDiv").eq(i).css("background", generateRandomGradient());
      $(".genreText").eq(i).text(genres[i]);
    }
  };

  function intervalGenresFailsafe(temp)
  {
    if(!genreMode)
      SongBarInterval = setInterval(function () { playSong(songs[selected]["songs"][selectedSong]["length"]);  }, 100);
    else
    {
      SongBarInterval = setInterval(function () { playSong(genreSongLengths[temp]);  }, 100);
    }
  };

  function loadSongsFromGenre(genre)
  {
    var loadSongsCounter = 0;

    //load the matching songs
    for(let i = 0; i < songs.length; i++)
      {
        for(let j = 0; j < songs[i]["songs"].length; j++)
        {
          if(songs[i]["songs"][j]["genre"] === genre)
          {
            genreSongLengths[loadSongsCounter] = songs[i]["songs"][j]["length"];
            $(".trackContainer").eq(loadSongsCounter).css("opacity", "100");
            $(".trackCoverImage").eq(loadSongsCounter).attr("src", "./songCovers/" + songs[i]["songs"][j]["cover"]);
            $(".trackText").eq(loadSongsCounter).text(songs[i]["songs"][j]["title"]);
            $(".lengthText").eq(loadSongsCounter).text(formatSeconds(songs[i]["songs"][j]["length"]));
            loadSongsCounter++;
          }
        }
      }
    //unload the rest
    for(let i = 0; i < 9 - loadSongsCounter; i++)
    {
      $(".trackContainer").eq(i + loadSongsCounter).css("opacity", "0");
    }
  };
    
  //load the albums into the objects 
  setTimeout(function(){ loadAlbums(); }, 100);
  setTimeout(function(){ loadGenres(); }, 200);

  function nextSong()
  {
    if($(".trackContainer").eq(selectedSong + 1).css("opacity") !== "0" && selectedSong < 8)
    {
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      selectedSong++;
      lastClickedTrackIndex++;
      $(".trackContainer").eq(selectedSong).css("background-color", "#908788");
    }
    else
    {
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      selectedSong = 0;
      lastClickedTrackIndex = 0;
      $(".trackContainer").eq(selectedSong).css("background-color", "#908788");
    }

    clearInterval(SongBarInterval);
    currentTime = 0;
    intervalGenresFailsafe(lastClickedTrackIndex);
    clicked = true;
  };

  function previousSong()
  {
    if(selectedSong > 0)
    {
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      selectedSong--;
      lastClickedTrackIndex--;
      $(".trackContainer").eq(selectedSong).css("background-color", "#908788");
    }
    else
    {
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      selectedSong = 8;
      lastClickedTrackIndex = 8;
      $(".trackContainer").eq(selectedSong).css("background-color", "#908788");
    }

    clearInterval(SongBarInterval);
    currentTime = 0;
    intervalGenresFailsafe(lastClickedTrackIndex);
    clicked = true;
  };

  function playSong(length)
  {
      $(".playedBar").css("width", currentTime + "%");
      currentTime += 10 / length;
      if(currentTime >= 100)
      {
        nextSong();
      }
  };

  function setPlayIconToPause()
  {
    $(".playIcon").css("transform", "rotate(0deg)");
    $(".playIcon").attr("src", "./icons/pause.svg");
  };

  //album player loading logic 
  $(".bigAlbumContainer").click(function () {
    if($(this).css("opacity") != 0)
    {
      $(".bigAlbumContainer").eq(selected).css("background-color", "#6B6363");
      $(this).css("background-color", "#908788");
      selected = $(".bigAlbumContainer").index(this);

      //load songs from given album into player
      for(let i = 0; i < songs[selected]["songs"].length; i++)
      {
        $(".trackContainer").eq(i).css("opacity", "100");
        $(".trackCoverImage").eq(i).attr("src", "./songCovers/" + songs[selected]["songs"][i]["cover"]);
        $(".trackText").eq(i).text(songs[selected]["songs"][i]["title"]);
        $(".lengthText").eq(i).text(formatSeconds(songs[selected]["songs"][i]["length"]));
      }

      //unload the rest of the song slots 
      tracksResetCounter = songs[selected]["songs"].length;
      for(let i = 0; i < 9 - songs[selected]["songs"].length; i++)
      {
        $(".trackContainer").eq(tracksResetCounter).css("opacity", "0");
        tracksResetCounter += 1;
      }

      //reset and start song bar sequence 
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      $(".trackContainer").eq(0).css("background-color", "#908788");
      selectedSong = $(".trackContainer").index(0);
      clearInterval(SongBarInterval);
      currentTime = 0;
      setPlayIconToPause();
      clicked = true;
      SongBarInterval = setInterval(function () { playSong(songs[selected]["songs"][selectedSong]["length"]);  }, 100);
    }
  });

  $(".bigGenreContainer").click(function(){
    loadSongsFromGenre($(this).children(".genreText").text());

    //reset and start song bar sequence 
    $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
    $(".trackContainer").eq(0).css("background-color", "#908788");
    selectedSong = $(".trackContainer").index(0);
    clearInterval(SongBarInterval);
    currentTime = 0;
    setPlayIconToPause();
    clicked = true;
    SongBarInterval = setInterval(function () { playSong(genreSongLengths[0]);  }, 100);
  });

  $(".trackContainer").click(function(){
    if($(this).css("opacity") != 0)
    {
      //cosmetic changes, unselecting previous selecting current
      $(".trackContainer").eq(selectedSong).css("background-color", "#6B6363");
      $(this).css("background-color", "#908788");
      selectedSong = $(".trackContainer").index(this);

      //interval logic
      clearInterval(SongBarInterval);
      setPlayIconToPause();
      currentTime = 0;
      clicked = true;
      lastClickedTrackIndex = $(".trackContainer").index(this);
      intervalGenresFailsafe(lastClickedTrackIndex);
    }
  });

  //play song bar 
  $(".playIcon").click(function(){
    $(".playIcon").css("background-color", "#f07272");
    const changeBackColor = setTimeout(function(){
      $(".playIcon").css("background-color", "#eb4c4c");
    }, 200);
    if(clicked === false)
    {
      $(this).css("transform", "rotate(0deg)");
      $(this).attr("src", "./icons/pause.svg");
      clicked = true;
      intervalGenresFailsafe(lastClickedTrackIndex);
    }
    else
    {
      $(this).css("transform", "rotate(90deg)");
      $(this).attr("src", "./icons/triangle.svg");
      clearInterval(SongBarInterval);
      clicked = false;
    }
  });

  $(".playIcon").hover(function () {
      if(clicked)
      {
        $(this).css("transform", "scale(1.1)");
      }
      else
      {
        $(this).css("transform", "scale(1.1) rotate(90deg)");
      }
    }, function () {
      if(clicked)
        {
          $(this).css("transform", "scale(1)");
        }
        else
        {
          $(this).css("transform", "scale(1) rotate(90deg)");
        }
    }
  );

  $(".nextSongIcon").click(function(){
    nextSong();
  });

  $(".previousSongIcon").click(function(){
    previousSong();
  });

  //change content of main page
  $(".homeContainer").click(function(){
    genreMode = false;
    $(".genresPage").css("display", "none");
    $(".homepage").css("display", "flex");
  });
  $(".genresContainer").click(function(){
    genreMode = true;
    $(".genresPage").css("display", "flex");
    $(".homepage").css("display", "none");
  });
});

var input = document.getElementById("searchSubmit");

input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("searchBar").click();
  }
});