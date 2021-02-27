console.log('hello from client side');

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlcmlucGl5dW1hbnRoYSIsImEiOiJja2xuNHN5NDMwNXM2MnBxbXNkNHB4N2kzIn0.c7R8GXb5Seu7lgzTrEO1uw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cherinpiyumantha/ckln68u7p431x17k8aznxixa3',
    scrollZoom:false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // add popup
    new mapboxgl.Popup({
        offset: 30
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

    // extends map bounds to  include current locations
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right:100
    }
});