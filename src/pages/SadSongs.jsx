function to(){
const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";


async function getToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}


async function searchSongs(query) {
  const token = await getToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log(data.tracks.items.map(track => track.name + " - " + track.artists[0].name));
}

searchSongs("Arijit Singh");
}
export default to;