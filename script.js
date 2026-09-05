const weatherForm = document.querySelector('#weather-form');
const locationInput = document.querySelector('#location');
const weatherStatus = document.querySelector('#weather-status');
const weatherDashboard = document.querySelector('#weather-dashboard');
const outfitResult = document.querySelector('#outfit-result');
const outfitDisplay = document.querySelector('#outfit-display');
let currentWeather = null;
let lastOutfitId = null;

const weatherDescriptions = { 0: ['☀️', 'Clear skies'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'], 45: ['🌫️', 'Misty'], 48: ['🌫️', 'Misty'], 51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'], 61: ['🌦️', 'Light rain'], 63: ['🌧️', 'Rainy'], 65: ['🌧️', 'Heavy rain'], 71: ['🌨️', 'Light snow'], 73: ['❄️', 'Snowy'], 75: ['❄️', 'Heavy snow'], 80: ['🌦️', 'Showers'], 81: ['🌧️', 'Rain showers'], 82: ['🌧️', 'Heavy showers'], 95: ['⛈️', 'Stormy'], 99: ['⛈️', 'Stormy'] };
const wardrobe = [
	{ id: 'cosy-grey', top: 'yellow_jumper.png', bottom: 'grey_trousers.png', shoes: 'sneakers.png', text: 'a cosy yellow jumper, grey trousers, and sneakers', min: -20, max: 14, vibes: ['Cosy', 'Cool'], plans: ['College', 'Casual'] },
	{ id: 'cosy-jeans', top: 'yellow_jumper.png', bottom: 'blue_jeans.png', shoes: 'sneakers.png', text: 'a sunny yellow jumper, blue jeans, and sneakers', min: -20, max: 17, vibes: ['Cosy', 'Artsy'], plans: ['College', 'Casual'] },
	{ id: 'red-jeans', top: 'red_shirt.png', bottom: 'blue_jeans.png', shoes: 'ballet_flats.png', text: 'a cute red shirt, blue jeans, and ballet flats', min: 8, max: 22, vibes: ['Cool', 'Science-y'], plans: ['College', 'Dinner'] },
	{ id: 'red-low-jeans', top: 'red_shirt.png', bottom: 'low_jeans.png', shoes: 'sneakers.png', text: 'a red shirt, low-rise jeans, and sneakers', min: 10, max: 25, vibes: ['Cool', 'Artsy'], plans: ['Party!', 'Casual'] },
	{ id: 'tee-skirt', top: 'white_tee.png', bottom: 'white_skirt.png', shoes: 'ballet_flats.png', text: 'a pretty white tee, flowy skirt, and ballet flats', min: 17, max: 40, vibes: ['Artsy', 'Science-y'], plans: ['Dinner', 'Party!'] },
	{ id: 'tee-jeans', top: 'white_tee.png', bottom: 'blue_jeans.png', shoes: 'sneakers.png', text: 'a classic white tee, blue jeans, and sneakers', min: 15, max: 40, vibes: ['Cool', 'Science-y'], plans: ['College', 'Casual'] }
];

async function loadWeather(location) {
	weatherStatus.textContent = 'Checking the forecast...';
	weatherDashboard.hidden = true;
	try {
		const search = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
		const places = await search.json();
		if (!places.results?.length) throw new Error('Location not found');
		const place = places.results[0];
		const forecast = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=auto`);
		const data = await forecast.json();
		currentWeather = { ...data.current, rain: data.hourly.precipitation_probability[0], place: place.name };
		const [icon, description] = weatherDescriptions[currentWeather.weather_code] || ['🌈', 'Changeable'];
		document.querySelector('#weather-icon').textContent = icon;
		document.querySelector('#temperature').textContent = `${Math.round(currentWeather.temperature_2m)}°C`;
		document.querySelector('#weather-description').textContent = description;
		document.querySelector('#feels-like').textContent = `${Math.round(currentWeather.apparent_temperature)}°C`;
		document.querySelector('#rain-chance').textContent = `${currentWeather.rain}%`;
		document.querySelector('#wind-speed').textContent = `${Math.round(currentWeather.wind_speed_10m)} km/h`;
		weatherStatus.textContent = `Forecast for ${currentWeather.place}`;
		weatherDashboard.hidden = false;
	} catch (error) {
		weatherStatus.textContent = 'We could not find that place. Try another town or city.';
	}
}

weatherForm.addEventListener('submit', (event) => { event.preventDefault(); loadWeather(locationInput.value.trim() || 'Dublin'); });
document.querySelectorAll('.choice-group').forEach((group) => group.addEventListener('click', (event) => {
	if (!event.target.matches('button')) return;
	group.querySelectorAll('button').forEach((button) => button.classList.remove('selected'));
	event.target.classList.add('selected');
}));
document.querySelector('#dress-me').addEventListener('click', () => {
	if (!currentWeather) { outfitResult.textContent = 'Choose a location first so I can dress you for the weather 🎀'; return; }
	const { temperature_2m: temperature, rain, wind_speed_10m: wind } = currentWeather;
	const plan = document.querySelector('[data-choice="plans"] .selected')?.textContent;
	const vibe = document.querySelector('[data-choice="vibe"] .selected')?.textContent;
	const suitable = wardrobe.filter((item) => temperature >= item.min && temperature <= item.max);
	const matching = suitable.filter((item) => (!plan || item.plans.includes(plan)) && (!vibe || item.vibes.includes(vibe)));
	const options = matching.length ? matching : suitable.length ? suitable : wardrobe;
	const freshOptions = options.filter((item) => item.id !== lastOutfitId);
	const outfit = (freshOptions.length ? freshOptions : options)[Math.floor(Math.random() * (freshOptions.length || options.length))];
	lastOutfitId = outfit.id;
	const extra = rain > 50 ? ' Bring an umbrella!' : wind > 25 ? ' Add a light jacket for the breeze.' : ' Finish with your favourite bow accessory.';
	outfitResult.textContent = `Your weather-ready look: ${outfit.text}.${extra}`;
	outfitDisplay.innerHTML = [
		['Top', outfit.top], ['Bottom', outfit.bottom], ['Shoes', outfit.shoes]
	].map(([label, file]) => `<figure><img src="clothes/${file}" alt="${label}: ${file.replace('.png', '').replaceAll('_', ' ')}"><figcaption>${label}</figcaption></figure>`).join('');
});
loadWeather('Dublin');
