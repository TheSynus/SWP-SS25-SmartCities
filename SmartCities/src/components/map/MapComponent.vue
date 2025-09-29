<template>
  <div class="h-full flex flex-col p-2">
    <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div id="map" class="h-full w-full rounded-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as L from 'leaflet';

let testGeoLayer = null

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  markers: {
    type: Array,
    default: () => []
  },
  selectedMarker: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  fitBoundsOnLoad: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['marker-click', 'map-click']);

// Map setup
const map = ref(null);
const markersLayer = ref(null);
const leafletMarkers = ref(new Map()); 
const isInitialized = ref(false);
const currentOpenPopup = ref(null); 

// Hamburg coordinates
const latitude = ref(53.5837);  
const longitude = ref(9.6984);
const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

// Helper function to get category by ID
const getCategoryById = (categoryId) => {
  return props.categories.find(cat => cat.id === categoryId);
};

// Create custom colored marker icon
const createColoredIcon = (color = '#3388ff', isSelected = false) => {
  const size = isSelected ? 35 : 25;
  const iconSize = [size, size * 1.2];

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${isSelected ? '3px' : '2px'} solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: ${size * 0.4}px;
          font-weight: bold;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: iconSize,
    iconAnchor: [size / 2, size * 1.2 * 0.85],
    popupAnchor: [0, -size * 1.2 * 0.85]
  });
};


const createPopupContent = (marker) => {
  const category = getCategoryById(marker.categoryId);
  const categoryName = category?.name || 'Unbekannt';
  const categoryColor = category?.color || '#3388ff';
  
  return `
    <div class="marker-popup" style="min-width: 200px;">
      <div style="
        background: ${categoryColor};
        color: white;
        padding: 8px 12px;
        margin: -8px -12px 8px -12px;
        border-radius: 4px 4px 0 0;
        font-weight: bold;
        font-size: 14px;
      ">
        ${categoryName}
      </div>
      
      <div style="padding: 4px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">
          ${marker.title || 'Ohne Titel'}
        </h3>
        
        ${marker.description ? `
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${marker.description}
          </p>
        ` : ''}
        
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 12px; color: #888;">
          ${marker.address ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span>📍</span>
              <span>${marker.address}</span>
            </div>
          ` : ''}
          
          ${marker.createdAt ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span>📅</span>
              <span>${new Date(marker.createdAt).toLocaleDateString('de-DE')}</span>
            </div>
          ` : ''}
          
          ${marker.tags && marker.tags.length > 0 ? `
            <div style="margin-top: 8px;">
              ${marker.tags.map(tag => `
                <span style="
                  background: #f0f0f0;
                  padding: 2px 6px;
                  border-radius: 12px;
                  font-size: 11px;
                  margin-right: 4px;
                  display: inline-block;
                ">#${tag}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #eee;
          text-align: center;
        ">
          <button 
            onclick="window.selectMarker('${marker.id}')"
            style="
              background: ${categoryColor};
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              font-weight: bold;
            "
          >
            Details anzeigen
          </button>
        </div>
      </div>
    </div>
  `;
};

// Handle popup positioning during zoom
const handlePopupPositioning = () => {
  if (!map.value || !currentOpenPopup.value) return;
  
  try {
    // Force popup to update its position
    map.value.closePopup();
    nextTick(() => {
      if (currentOpenPopup.value) {
        currentOpenPopup.value.openPopup();
      }
    });
  } catch (error) {
    console.error('Error handling popup positioning:', error);
  }
};

// Update only the visual appearance of existing markers
const updateMarkerAppearance = () => {
  if (!map.value || !markersLayer.value || !isInitialized.value) return;

  try {
    leafletMarkers.value.forEach((leafletMarker, markerId) => {
      const marker = props.markers.find(m => m.id === markerId);
      if (!marker) return;

      const category = getCategoryById(marker.categoryId);
      const isSelected = props.selectedMarker?.id === marker.id;
      const newIcon = createColoredIcon(category?.color || '#3388ff', isSelected);
      
      const wasPopupOpen = leafletMarker.isPopupOpen();
      leafletMarker.setIcon(newIcon);
      
      // Update popup content
      if (leafletMarker.getPopup()) {
        leafletMarker.getPopup().setContent(createPopupContent(marker));
      }
      
      // Handle popup state for selected marker
      if (isSelected && !leafletMarker.isPopupOpen()) {
        leafletMarker.openPopup();
        currentOpenPopup.value = leafletMarker;
      } else if (!isSelected && leafletMarker.isPopupOpen()) {
        leafletMarker.closePopup();
        if (currentOpenPopup.value === leafletMarker) {
          currentOpenPopup.value = null;
        }
      }
      
      // Restore popup state if it was open and marker is selected
      if (wasPopupOpen && isSelected) {
        leafletMarker.openPopup(); 
      }
    });
  } catch (error) {
    console.error('Error updating marker appearance:', error);
  }
};


const addNewMarkers = () => {
  if (!map.value || !markersLayer.value || !isInitialized.value) return;

  try {
    props.markers.forEach(marker => {
      if (!marker.coordinates?.lat || !marker.coordinates?.lng) return;
      if (leafletMarkers.value.has(marker.id)) return; 

      const category = getCategoryById(marker.categoryId);
      const isSelected = props.selectedMarker?.id === marker.id;
      const markerIcon = createColoredIcon(category?.color || '#3388ff', isSelected);

      const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lng], {
        icon: markerIcon
      });

      const popup = L.popup({
        maxWidth: 300,
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
        closeOnEscapeKey: true,
        keepInView: true,
        autoPan: true,
        autoPanPadding: [10, 10]
      });

      leafletMarker.bindPopup(popup);
      leafletMarker.getPopup().setContent(createPopupContent(marker));

      leafletMarker.on('popupopen', () => {
        currentOpenPopup.value = leafletMarker;
      });

      leafletMarker.on('popupclose', () => {
        if (currentOpenPopup.value === leafletMarker) {
          currentOpenPopup.value = null;
        }
      });

      leafletMarker.on('click', () => {
        emit('marker-click', marker);
      });

      markersLayer.value.addLayer(leafletMarker);
      leafletMarkers.value.set(marker.id, leafletMarker);

      if (isSelected) {
        leafletMarker.openPopup();
        currentOpenPopup.value = leafletMarker;
      }
    });
  } catch (error) {
    console.error('Error adding new markers:', error);
  }
};

const removeObsoleteMarkers = () => {
  if (!markersLayer.value || !isInitialized.value) return;

  try {
    const currentMarkerIds = new Set(props.markers.map(m => m.id));
    
    leafletMarkers.value.forEach((leafletMarker, markerId) => {
      if (!currentMarkerIds.has(markerId)) {

        if (currentOpenPopup.value === leafletMarker) {
          currentOpenPopup.value = null;
        }
        markersLayer.value.removeLayer(leafletMarker);
        leafletMarkers.value.delete(markerId);
      }
    });
  } catch (error) {
    console.error('Error removing obsolete markers:', error);
  }
};

const updateChangedPositions = () => {
  if (!map.value || !markersLayer.value || !isInitialized.value) return;

  try {
    props.markers.forEach(marker => {
      if (!marker.coordinates?.lat || !marker.coordinates?.lng) return;
      
      const leafletMarker = leafletMarkers.value.get(marker.id);
      if (!leafletMarker) return;

      const currentLatLng = leafletMarker.getLatLng();
      const newLat = marker.coordinates.lat;
      const newLng = marker.coordinates.lng;


      if (Math.abs(currentLatLng.lat - newLat) > 0.000001 || 
          Math.abs(currentLatLng.lng - newLng) > 0.000001) {
        
        const wasPopupOpen = leafletMarker.isPopupOpen();
        
        leafletMarker.setLatLng([newLat, newLng]);
        

        if (wasPopupOpen) {
          leafletMarker.openPopup();
        }
      }
    });
  } catch (error) {
    console.error('Error updating marker positions:', error);
  }
};

const updateMapMarkers = () => {
  if (!map.value || !markersLayer.value || !isInitialized.value) return;

  removeObsoleteMarkers();
  addNewMarkers();
  updateChangedPositions();
  updateMarkerAppearance();
};


const initializeMarkers = () => {
  if (!map.value || !markersLayer.value) return;

  try {
    markersLayer.value.clearLayers();
    leafletMarkers.value.clear();
    currentOpenPopup.value = null;

    props.markers.forEach(marker => {
      if (!marker.coordinates?.lat || !marker.coordinates?.lng) return;

      const category = getCategoryById(marker.categoryId);
      const isSelected = props.selectedMarker?.id === marker.id;
      const markerIcon = createColoredIcon(category?.color || '#3388ff', isSelected);

      const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lng], {
        icon: markerIcon
      });

      const popup = L.popup({
        maxWidth: 300,
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
        closeOnEscapeKey: true,
        keepInView: true,
        autoPan: true,
        autoPanPadding: [10, 10]
      });

      leafletMarker.bindPopup(popup);
      leafletMarker.getPopup().setContent(createPopupContent(marker));

      leafletMarker.on('popupopen', () => {
        currentOpenPopup.value = leafletMarker;
      });

      leafletMarker.on('popupclose', () => {
        if (currentOpenPopup.value === leafletMarker) {
          currentOpenPopup.value = null;
        }
      });

      leafletMarker.on('click', () => {
        emit('marker-click', marker);
      });

      markersLayer.value.addLayer(leafletMarker);
      leafletMarkers.value.set(marker.id, leafletMarker);

      if (isSelected) {
        leafletMarker.openPopup();
        currentOpenPopup.value = leafletMarker;
      }
    });


    if (props.fitBoundsOnLoad && props.markers.length > 0) {
      fitBoundsToMarkers();
    }
  } catch (error) {
    console.error('Error initializing markers:', error);
  }
};


const fitBoundsToMarkers = () => {
  if (!map.value || !markersLayer.value || !isInitialized.value) return;
  
  try {
    if (props.markers.length > 0) {
      const group = new L.featureGroup(markersLayer.value.getLayers());
      if (group.getBounds().isValid()) {
        map.value.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  } catch (error) {
    console.error('Error fitting bounds to markers:', error);
  }
};


const centerOnMarker = (marker, zoom = null) => {
  if (!map.value || !isInitialized.value) return;
  
  try {
    if (marker?.coordinates?.lat && marker?.coordinates?.lng) {
      if (zoom) {
        map.value.setView([marker.coordinates.lat, marker.coordinates.lng], zoom);
      } else {
        map.value.panTo([marker.coordinates.lat, marker.coordinates.lng]);
      }
    }
  } catch (error) {
    console.error('Error centering on marker:', error);
  }
};


window.selectMarker = (markerId) => {
  const marker = props.markers.find(m => m.id === markerId);
  if (marker) {
    emit('marker-click', marker);
  }
};


const initializeMap = () => {
  try {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found during initialization');
      return;
    }

    if (map.value) {
      console.warn('Map already initialized');
      return;
    }

    const containerRect = mapContainer.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      console.warn('Map container has no dimensions, retrying...');
      setTimeout(() => initializeMap(), 100);
      return;
    }

    map.value = L.map('map', {
      zoomAnimation: true,
      zoomAnimationThreshold: 4,
      fadeAnimation: true,
      markerZoomAnimation: true
    }).setView([latitude.value, longitude.value], 13);
    
    L.tileLayer(tileLayerUrl, {
      maxZoom: 19,
      attribution: attribution
    }).addTo(map.value);

    markersLayer.value = L.layerGroup().addTo(map.value);
    
    map.value.on('click', (e) => {
      emit('map-click', {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        latlng: e.latlng
      });
    });


    map.value.on('zoomstart', () => {
      if (currentOpenPopup.value && currentOpenPopup.value.isPopupOpen()) {
        map.value.closePopup();
      }
    });

    map.value.on('zoomend', () => {
      if (currentOpenPopup.value) {
        setTimeout(() => {
          currentOpenPopup.value.openPopup();
        }, 50);
      }
    });

    map.value.on('viewreset', () => {
      if (currentOpenPopup.value) {
        setTimeout(() => {
          currentOpenPopup.value.openPopup();
        }, 50);
      }
    });

    isInitialized.value = true;

    nextTick(() => {
      initializeMarkers();
    });

  } catch (error) {
    console.error('Error initializing map:', error);
    isInitialized.value = false;
  }
};

// Watcher for markers array changes (add/remove/position changes)
watch(() => props.markers, (newMarkers, oldMarkers) => {
  if (!isInitialized.value) return;
  
  try {
    if (JSON.stringify(newMarkers) !== JSON.stringify(oldMarkers)) {
      updateMapMarkers();
    }
  } catch (error) {
    console.error('Error in markers watcher:', error);
  }
}, { deep: true });

// Watcher for category changes
watch(() => props.categories, () => {
  if (!isInitialized.value) return;
  
  try {
    updateMarkerAppearance();
  } catch (error) {
    console.error('Error in categories watcher:', error);
  }
}, { deep: true });

// Watcher for selected marker changes
watch(() => props.selectedMarker, (newSelected, oldSelected) => {
  if (!isInitialized.value) return;
  
  try {
    if (newSelected?.id !== oldSelected?.id) {
      updateMarkerAppearance();
    }
  } catch (error) {
    console.error('Error in selectedMarker watcher:', error);
  }
}, { deep: true });


onMounted(async () => {
  try {
    await nextTick();
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    initializeMap();
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});


onUnmounted(() => {
  try {
    if (window.selectMarker) {
      delete window.selectMarker;
    }

    leafletMarkers.value.clear();
    currentOpenPopup.value = null;
    
    if (map.value) {
      map.value.remove();
      map.value = null;
    }
    
    markersLayer.value = null;
    isInitialized.value = false;
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
});

// Expose methods for parent component
defineExpose({
  updateMapMarkers,
  fitBoundsToMarkers,
  centerOnMarker,
  updateMarkerAppearance,
  handlePopupPositioning,
  map
});
</script>

<style scoped>
#map {
  min-height: 400px;
}

/* Custom popup styling */
:global(.custom-popup .leaflet-popup-content-wrapper) {
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

:global(.custom-popup .leaflet-popup-content) {
  margin: 0;
  line-height: 1.4;
}

:global(.custom-popup .leaflet-popup-tip) {
  background: white;
}

:global(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

/* Improve popup positioning during animations */
:global(.leaflet-popup-pane) {
  z-index: 700;
}

:global(.leaflet-popup) {
  transition: none !important;
}
</style>