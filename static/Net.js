let playerWhiteLoggedIn = false;
let playerBlackLoggedIn = false;
let bothPlayersLogged = false;
let yourTurn = false;
let yourColor = "";

document.getElementById("loginBtn").onclick = function () {
  const login = document.getElementById("loginInput").value;
  console.log(login);
  if (login != "") {
    const body = login; // body czyli przesyłane na serwer dane

    //const headers = { "Content-Type": "application/json" } // nagłowek czyli typ danych

    fetch("/loginPlayer", { method: "post", body }) // fetch
      .then((response) => response.json())
      .then(
        (data) => {
          console.log(data);
          if (data.color == "white") {
            document.getElementById("statusBar").innerHTML = "";
            document.getElementById(
              "statusBar"
            ).innerHTML += `<h2>Witaj <span style="color:white;">${login}</span>, grasz białymi.</h2>`;
            document.getElementById("userLogin").style.display = "none";
            document.getElementById("bg").style.display = "none";
            playerWhiteLoggedIn = true;
            document.querySelector(".waiting").style.display = "flex";
            yourColor = "white";
            handleQuee();
          }
          if (data.color == "black") {
            document.getElementById("statusBar").innerHTML = "";
            document.getElementById(
              "statusBar"
            ).innerHTML += `<h2>Witaj <span style="color:white;">${login}</span>, grasz czarnymi.</h2>`;
            document.getElementById("userLogin").style.display = "none";
            document.getElementById("bg").style.display = "none";
            playerBlackLoggedIn = true;
            playerWhiteLoggedIn = true;
            bothPlayersLogged = true;
            yourColor = "black";
          }
          if (data.color == "no color") {
            document.getElementById("statusBar").innerHTML = "";
            document.getElementById(
              "statusBar"
            ).innerHTML += `<h2>Dwóch graczy już jest w grze.</h2>`;
          }
          if (data.color == "login powtórzony") {
            document.getElementById("statusBar").innerHTML = "";
            document.getElementById(
              "statusBar"
            ).innerHTML += `<h2>Gracz o takim loginie już się zarejestrował.</h2>`;
          }
          if (playerBlackLoggedIn) {
            document.querySelector(".waiting").style.display = "flex";
            document.querySelector("#text").innerHTML = 30;
          }
        } // dane odpowiedzi z serwera
      );
  }
};

const reset = () => {
  const body = {};
  fetch("/reset", { method: "post", body }) // fetch
    .then((response) => response.json())
    .then((data) => {
      playerWhiteLoggedIn = false;
      playerBlackLoggedIn = false;
      yourColor = "";
    });
};

document.getElementById("resetBtn").addEventListener("click", reset);

const handleQuee = () => {
  const body = {};
  fetch("/quee", { method: "post", body }) // fetch
    .then((response) => response.json())
    .then((data) => {
      if (data.users < 2) setTimeout(handleQuee, 1000);
      else {
        document.querySelector(".waiting").style.display = "none";
        bothPlayersLogged = true;
        yourTurn = true;
      }
    });
};
