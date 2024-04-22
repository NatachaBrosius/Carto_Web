var myMap = L.map('map').setView([46.866999, -71.417999], 12);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(myMap);

var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {});

var ecoleLayer, bassinLayer; // Déclarer les variables de couche à l'extérieur

const ecole = '..//Donnee/data.geojson';
const bassin ='..//Donnee/Bassin.geojson';

fetch(ecole)
    .then(response => response.json())
    .then(data => {
        ecoleLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/?size=24&id=EOn31zjdfgcn&format=png',
                        iconSize: [20, 20],
                        iconAnchor: [15, 30],
                    })
                });
                marker.bindPopup(`<b>${feature.properties.nom_ecole}</br>${feature.properties.adr_ecole}</br>${feature.properties.code_post_ecole},${feature.properties.ville_ecole}</br>Moyenne globale:${feature.properties.Moyenne_globale}/5</b>`).openPopup();
                return marker;
            }
        });
        ecoleLayer.addTo(myMap);
    });

fetch(bassin)
    .then(response => response.json())
    .then(data => {
        bassinLayer = L.geoJSON(data, {
            style: function (feature) {
                var couleur = feature.properties.Couleur;
                var fillColor;
                switch (couleur) {
                    case '1':
                        fillColor = '#FBB4AE';
                        break;
                    case '2':
                        fillColor = '#B3CDE3';
                        break;
                    case '3':
                        fillColor = '#CCEBC5';
                        break;
                    case '4':
                        fillColor = '#DECBE4';
                        break;
                    case '5':
                        fillColor = '#FED9A6';
                        break;
                    default:
                        fillColor = '#cccccc';
                }

                return {
                    color: '#6E6E6E',
                    weight: 1,
                    fillOpacity: 0.5,
                    fillColor: fillColor
                };
            }
        });

        bassinLayer.addTo(myMap);

        var baseLayers = {
            "OpenStreetMap": osm,
            "Topo selon ESRI": topo
        };

        var overlays = {
            "École": ecoleLayer,
            "Bassin de desserte": bassinLayer
        };

        L.control.layers(baseLayers, overlays).addTo(myMap);
    });

L.control.scale({
    position: 'topleft',
    maxWidth: 100,
    imperial: false
}).addTo(myMap);

L.control.legend({
    position: "bottomleft",
    legends: [{
        label: "Ecole",
        type: "image",
        url: "https://img.icons8.com/?size=24&id=EOn31zjdfgcn&format=png",
    },
    {
        label: "Bassin",
        type: "image",
        url: '', 
    },
    {
        label: "",
        type: "image",
        url: '../Image/Bassin1.png',
    },{
        label: "",
        type: "image",
        url: '../Image/Bassin2.png',
    },{
        label: "",
        type: "image",
        url: '../Image/Bassin3.png',
    },{
        label: "",
        type: "image",
        url: '../Image/Bassin4.png',
    },{
        label: "",
        type: "image",
        url: '../Image/Bassin5.png',
    }]
}).addTo(myMap);

var EvaluateSchoolControl = L.Control.extend({
    onAdd: function(map) {
        var button = L.DomUtil.create('button');
        button.innerHTML = 'Évaluer mon école';
        button.className = 'evaluate-button';
        button.onclick = function() {
            window.location.href = 'https://survey123.arcgis.com/share/2a29a8334131406ea2bb8d68eae3215b';
        };
        return button;
    }
});

(new EvaluateSchoolControl()).addTo(myMap);


// Créez une instance du contrôle de recherche
var searchControl = new L.Control.Search({
    position: 'topright', // Position du contrôle de recherche
    layer: ecoleLayer, // Utilisez la couche ecoleLayer pour la recherche
    propertyName: 'nom_ecole', // Propriété à rechercher dans les données
    marker: false, // Indique si les marqueurs doivent être affichés pour les résultats de recherche
    moveToLocation: function(latlng, title, myMap) {
        // Définir ce que vous souhaitez faire lorsque l'utilisateur sélectionne un résultat de recherche
        myMap.setView(latlng, 15); // Centrer la carte sur le résultat avec un zoom de 18
    }
});

// Ajoutez le contrôle de recherche à votre carte
searchControl.addTo(myMap);