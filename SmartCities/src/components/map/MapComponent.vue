<!-- MapComponent.vue -->
<!-- Level2, Linker Unterbaum -->
 
<template>
  <div class="h-full flex flex-col p-2">
    <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div id="map" class="h-full w-full rounded-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import * as L from 'leaflet';

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
  }
});

const emit = defineEmits(['marker-click', 'map-click']);

// Map setup (no API calls here anymore)
const map = ref(null);
const markersLayer = ref(null);

const latitude = ref(53.5837);  // Hamburg coordinates
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
  const iconSize = isSelected ? [size, size * 1.2] : [size, size * 1.2];
  
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
        ">📍</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: iconSize,
    iconAnchor: [size / 2, size * 1.2],
    popupAnchor: [0, -size * 1.2]
  });
};

// Create popup content for marker
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

// Update markers on map
const updateMapMarkers = () => {
  if (!map.value || !markersLayer.value) return;
  
  // Clear existing markers
  markersLayer.value.clearLayers();
  
  // Add new markers from props
  props.markers.forEach(marker => {
    if (!marker.latitude || !marker.longitude) return;
    
    const category = getCategoryById(marker.categoryId);
    const isSelected = props.selectedMarker?.id === marker.id;
    const markerIcon = createColoredIcon(category?.color || '#3388ff', isSelected);
    
    const leafletMarker = L.marker([marker.latitude, marker.longitude], {
      icon: markerIcon
    });
    
    // Add popup
    leafletMarker.bindPopup(createPopupContent(marker), {
      maxWidth: 300,
      className: 'custom-popup'
    });
    
    // Add click event
    leafletMarker.on('click', () => {
      emit('marker-click', marker);
    });
    
    // Add to layer
    markersLayer.value.addLayer(leafletMarker);
  });
  
  // Fit map to markers if there are any
  if (props.markers.length > 0) {
    const group = new L.featureGroup(markersLayer.value.getLayers());
    if (group.getBounds().isValid()) {
      map.value.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }
};

// Global function for popup button
window.selectMarker = (markerId) => {
  const marker = props.markers.find(m => m.id === markerId);
  if (marker) {
    emit('marker-click', marker);
  }
};

// Initialize map
const initializeMap = () => {
  try {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found during initialization');
      return;
    }

    map.value = L.map('map').setView([latitude.value, longitude.value], 13);
    
    L.tileLayer(tileLayerUrl, {
      maxZoom: 19,
      attribution: attribution
    }).addTo(map.value);

    // Create markers layer
    markersLayer.value = L.layerGroup().addTo(map.value);
    
    // Add map click event
    map.value.on('click', (e) => {
      emit('map-click', {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        latlng: e.latlng
      });
    });

    // Load initial markers
    updateMapMarkers();

  } catch (error) {
    console.error('Error initializing map:', error);
  }
};

// Watch for prop changes
watch([
  () => props.markers,
  () => props.categories
], () => {
  updateMapMarkers();
}, { deep: true });

// Watch for selected marker changes
watch(() => props.selectedMarker, () => {
  updateMapMarkers();
  
  // Center map on selected marker
  if (props.selectedMarker && props.selectedMarker.latitude && props.selectedMarker.longitude) {
    map.value?.setView([props.selectedMarker.latitude, props.selectedMarker.longitude], 15);
  }
}, { deep: true });

// Mount logic
onMounted(async () => {
  await nextTick();
  
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  const containerRect = mapContainer.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) {
    console.warn('Map container has no dimensions, retrying...');
    setTimeout(() => initializeMap(), 100);
    return;
  }

  initializeMap();
});

// Expose methods for parent component
defineExpose({
  updateMapMarkers,
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
</style>