// Créer la carte avec vue initiale
var map = L.map('map').setView([0, 0], 3);

// Ajout de la couche OpenStreetMap à la carte
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
});

// Control d'échelle
L.control.scale().addTo(map);

// Créer une légende personnalisée pour les lignes
var customLegend = L.control({ position: 'bottomleft' });

customLegend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'Type_de_faille'); // Créer un élément div pour la légende
    div.innerHTML += '<strong>Magnitude</strong><br>';
    div.innerHTML += '<img src="eclair_blanc.png" alt="Magnitude faible" width="10"> <   3<br>';
    div.innerHTML += '<img src="eclair_jaune.png" alt="Magnitude moyenne" width="10">   >= 3<br>';
    div.innerHTML += '<img src="eclair_rouge.png" alt="Magnitude forte" width="10">   >= 6<br><br>';
    div.innerHTML += '<strong>Type de faille</strong><br>';
    div.innerHTML += '<svg height="20" width="20"><line x1="0" y1="15" x2="30" y2="15" style="stroke:#3366ff;stroke-width:2" /></svg> Faille<br>';
    div.innerHTML += '<svg height="20" width="20"><line x1="0" y1="15" x2="30" y2="15" style="stroke:#E7DDFF;stroke-width:2" /></svg> Tranchée<br>';
    div.innerHTML += '<svg height="20" width="20"><line x1="0" y1="15" x2="30" y2="15" style="stroke:#999999;stroke-width:2" /></svg> Autre<br>';
    return div;
};

customLegend.addTo(map); // Ajouter la légende à la carte
// Créer une couche pour les lignes de tranchée
var linesLayer;

// Charger le fichier GeoJSON contenant la couche de lignes
fetch('Trench.json')
    .then(response => response.json())
    .then(data => {
        // Créer une couche GeoJSON à partir des données chargées
        linesLayer = L.geoJSON(data, {
            style: function(feature) {
                // Déterminer le style en fonction de la propriété "datatype"
                var color, weight;

                if (feature.properties.datatype === 'RI') { // Tranchée de type RI
                    color = '#3366ff'; // Couleur pour la tranchée de type RI
                    weight = 2; // Épaisseur de la ligne pour la tranchée de type RI
                } else if (feature.properties.datatype === 'TR') { // Tranchée de type TR
                    color = '#E7DDFF'; // Couleur pour la tranchée de type TR
                    weight = 2; // Épaisseur de la ligne pour la tranchée de type TR
                } else {
                    color = '#999999'; // Couleur par défaut pour les autres types de tranchées
                    weight = 2; // Épaisseur de ligne par défaut
                }

                return {
                    color: color,
                    weight: weight,
                    opacity: 1 // Opacité de la ligne
                };
            }
        });

        // Ajouter la couche de lignes à la carte
        linesLayer.addTo(map);

        // Créer un objet de couches pour le contrôle de couches
        var baseLayers = {
            "OpenStreetMap": osm,
            "Topo selon ESRI": topo
        };

        var overlays = {
            "Failles": linesLayer,
            "Activités sismiques": markers
        };

        // Ajouter le contrôle de couches à la carte
        L.control.layers(baseLayers, overlays).addTo(map);
    });
// Charger le fichier GeoJSON contenant la couche de polygone
fetch('PB2002_plates.json')
    .then(response => response.json())
    .then(data => {
        // Créer une couche GeoJSON à partir des données chargées
        var PolyLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    fillColor: 'rgba(0, 0, 0, 0)', // Fond transparent (noir avec une transparence de 0)
                    color: 'rgba(0, 0, 0, 0)', // Contour transparent (noir avec une transparence de 0)
                    weight: 1, // Épaisseur du contour
                    opacity: 1 // Opacité du contour
                };
            },
            onEachFeature: function(feature, layer) {
                // Extraire les données du fichier GeoJSON pour l'étiquette
                var name = feature.properties.PlateName;

                // Ajouter l'étiquette à chaque polygone
                layer.bindTooltip(name, { direction: 'center', permanent: true, className: 'label-div-icon' });
            }
        });

        PolyLayer.addTo(map);

        // Gérer l'affichage des étiquettes en fonction du niveau de zoom
        map.on('zoomend', function() {
            var currentZoom = map.getZoom();
            if (currentZoom >= 4 && currentZoom < 12) {
                PolyLayer.eachLayer(function(layer) {
                    layer.openTooltip();
                });
            } else {
                PolyLayer.eachLayer(function(layer) {
                    layer.closeTooltip();
                });
            }
        });
    });

// Ajouter un Service fetch et donner les symboles personnalisés
var smn = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-03-01&endtime=2024-04-01';
var baseEpi;
var endroit;
var markers = L.markerClusterGroup(); // Création d'un groupe de marqueurs cluster
// Icons
var faible = L.icon({
    iconUrl: 'eclair_blanc.png',
    iconSize: [10, 20],
    iconAnchor: [10, 10]
});

var moyen = L.icon({
    iconUrl: 'eclair_jaune.png',
    iconSize: [10, 20],
    iconAnchor: [10, 10]
});
var fort = L.icon({
    iconUrl: 'eclair_rouge.png',
    iconSize: [10, 20],
    iconAnchor: [10, 10]
});

fetch(smn)
    .then(response => response.json())
    .then(data => {
        baseEpi = data.features;

        baseEpi.forEach(feature => {
            var magnitude = feature.properties.mag;
            var endroit = feature.properties.place;

            var icon;
            if (magnitude >= 6) {
                icon = fort;
            } else if (magnitude >= 3) {
                icon = moyen;
            } else {
                icon = faible;
            }

            var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: icon });
            // Création du contenu de la fenêtre contextuelle
            var popupContent = "<br><b>Lieu:</b> " + endroit + "<b> Magnitude:</b> " + magnitude;

            // Liaison de la fenêtre contextuelle au marqueur
            marker.bindPopup(popupContent);

            markers.addLayer(marker); // Ajout du marqueur au groupe de marqueurs cluster 
        });

        map.addLayer(markers); // Ajout du groupe de marqueurs cluster à la carte
    });

// Fonction de filtrage en fonction de la magnitude
function filterByMagnitude(minMagnitude, maxMagnitude) {
    // Effacer les anciens marqueurs de la carte
    markers.clearLayers();

    // Filtrer les données en fonction de la magnitude
    baseEpi.forEach(function(feature) {
        var magnitude = feature.properties.mag;

        if (magnitude >= minMagnitude && magnitude <= maxMagnitude) {
            var icon;
            if (magnitude >= 6) {
                icon = fort;
            } else if (magnitude >= 3) {
                icon = moyen;
            } else {
                icon = faible;
            }

            var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: icon });

            var popupContent = "<br><b>Lieu:</b> " + endroit + "<b> Magnitude:</b> " + magnitude;

            marker.bindPopup(popupContent);

            markers.addLayer(marker);
        }
    });

    map.addLayer(markers); // Ajout des nouveaux marqueurs filtrés à la carte
}

// Gestionnaire d'événement pour le bouton de filtre
document.getElementById('filter-button').addEventListener('click', function() {
    var minMagnitude = parseFloat(document.getElementById('min-magnitude').value);
    var maxMagnitude = parseFloat(document.getElementById('max-magnitude').value);

    // Filtrer en fonction de la magnitude spécifiée
    filterByMagnitude(minMagnitude, maxMagnitude);
});
