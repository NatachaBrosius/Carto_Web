 //Ajout de la carte centrée sur le milieu de la zone d'intéret
 var map = L.map('map').setView([46.866999, -71.417999], 12);

//  Chargement du fond de carte
var osm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
}).addTo(map);
//  Ajout de la données ponctuelle présente dans le geojson : mes écoles
const Geojson = '..//Donnee/data.geojson'

fetch(Geojson)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'https://img.icons8.com/?size=24&id=EOn31zjdfgcn&format=png', // Chemin vers l'image de l'école
                        iconSize: [20, 20], // Taille de l'icône
                        iconAnchor: [15, 30], // Point d'ancrage de l'icône
                    })
                });
                //Ajouter une popup au marqueur avec les informations de l'école sur simple clic
                marker.on('click', function (e) {
                    var nomOffclOrgns = feature.properties.NOM_OFFCL_ORGNS; // Récupérer la valeur du champ NOM_OFFCL_ORGNS = nom officiel de l'école
                    var adresse = feature.properties.ADRS_GEO_L1_GDUNO_IMM; // Récupérer la valeur du champ ADRS_GEO_L1_GDUNO_IMM = adresse de localisatiion de l'immeuble
                    var municipalité = feature.properties.NOM_MUNCP_GDUNO_IMM;// Récupérer la valeur du champ NOM_MUNCP_GDUNO_IMM = municipalité de l'immeuble
                    marker.bindPopup(`<b>${nomOffclOrgns}</br>${adresse},${municipalité}</b>`).openPopup();
                });
                return marker;
            }
        }).addTo(map);
    });
// Ajouter une couche Service REST 
var esri = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
);

// Ajouter une raster landsat ESRI
var imagery = L.esri.imageMapLayer({
    url: 'https://landsat.arcgis.com/arcgis/rest/services/Landsat/PS/ImageServer'
});
// Control de changement de fond de carte
var controlMaps = {
    "Fond de carte OSM": osm,
    "Service d'images d'ESRI": esri,
    "Service d'images Landsat": imagery,
};
L.control.layers(controlMaps).addTo(map);
// Ajout d'une échelle graphique
L.control.scale({
position:'topleft',
maxWidth : 100,
imperial : false}).addTo(map);

