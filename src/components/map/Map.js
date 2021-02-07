import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import qs from "qs";

import { fetchData } from "../../api/geo";
import storage from "../../libs/storage";

import { usePromiseTracker } from "react-promise-tracker";

import OPRLayer from "./OPRLayer";
import MapSidebar from "./blocks/sidebar/MapSidebar";
import ViewTracker from "./ViewTracker";
import OPRMessageOverlay from "./blocks/OPRMessageOverlay";
import MarkerBlock from "./blocks/MarkerBlock";
import Filter from "./blocks/Filter";
import MapSidebarBlock from "./blocks/sidebar/MapSidebarBlock";
import ReviewPlaces from "./blocks/ReviewPlaces";
import Loader from "../main/blocks/Loader";

const OPR_PLACE_URL_PREFIX = '/map/opr.place/';

export default function Map() {

  let mapLatLon = [40, -35];
  let mapZoom = 4;

  let hasParams = false;
  const reqParams = qs.parse(location.search.substring(1));
  const { q } = reqParams;
  if (q) {
    const mapParams = q.split("/");
    if (mapParams.length === 3) {
      let pZoom = mapParams[0];
      let pLat = mapParams[1];
      let pLon = mapParams[2];
      try {
        if (pZoom > 0 && pZoom < 32 && pLat >= -90 && pLat <= 90 && pLon >= -180 && pLon <= 180) {
          mapZoom = parseInt(pZoom, 10);
          mapLatLon = [parseFloat(pLat), parseFloat(pLon)];
          hasParams = true;
        }
      } catch (e) {
        console.warn('Error while decoding map parameters');
      }
    }
  }

  if (!hasParams) {
    try {
      const view = JSON.parse(storage.mapView || '');
      if (!!view) {
        mapZoom = view.zoom;
        mapLatLon = [view.lat, view.lng];
      }
    } catch (e) {
      console.warn('Error while decoding saved view');
    }
  }

  const reqPath = location.pathname;
  let oprPlaceId = null;
  let initialMarker = null;
  if (reqPath.startsWith(OPR_PLACE_URL_PREFIX)) {
    oprPlaceId = reqPath.substring(OPR_PLACE_URL_PREFIX.length)
    initialMarker = {
      initial: true,
      properties: { opr_id: `${oprPlaceId}`, title: `${oprPlaceId}`, subtitle: "", sources: [{}] },
      geometry: { coordinates: [mapLatLon[1], mapLatLon[0]] }
    };
  }

  const [placeTypes, setPlaceTypes] = useState({});
  const [filterVal, setFilter] = useState('all');
  const [marker, setMarker] = useState(initialMarker);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const { promiseInProgress } = usePromiseTracker();

  useEffect(() => {
    const request = async () => {
      const { parameters } = await fetchData();
      setPlaceTypes(parameters.placeTypes);
    };

    request();
  }, []);

  useEffect(() => {
    onMapStateChanged(mapZoom, mapLatLon[0], mapLatLon[1]);
  }, [marker]);

  const onMapStateChanged = (zoom, lat, lng) => {
    mapLatLon = [lat, lng];
    mapZoom = zoom;
    let coords = `q=${zoom}/${lat.toFixed(5)}/${lng.toFixed(5)}`;
    if (marker) {
      const { opr_id } = marker.properties;
      history.pushState(null, null, `/map/opr.place/${opr_id}?${coords}`);
    } else {
      history.pushState(null, null, `/map?${coords}`);
    }
  }

  return <MapContainer center={mapLatLon} zoom={mapZoom} zoomControl={false} whenReady={() => setLoading(false)}>
    <TileLayer
      attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
      url="https://tile.osmand.net/{z}/{x}/{y}.png"
      id="tiles"
    />
    <ViewTracker whenMoved={(map) => {
      onMapStateChanged(map.getZoom(), map.getCenter().lat, map.getCenter().lng);
    }} />
    {marker && <MarkerBlock marker={marker} setMarker={setMarker} />}

    <MapSidebar position="topright">
      <MapSidebarBlock>
        <Filter placeTypes={placeTypes} onSelect={setFilter} />
      </MapSidebarBlock>
      {/*<ReviewPlaces setMarker={setMarker} reload={reload}/>*/}
    </MapSidebar>

    {(loading || reload || promiseInProgress) && <OPRMessageOverlay><Loader position="relative" /></OPRMessageOverlay>}
    {!loading && <OPRLayer mapZoom={mapZoom} filterVal={filterVal} placeId={oprPlaceId} onSelect={setMarker} setLoading={setReload} />}
  </MapContainer>;
}