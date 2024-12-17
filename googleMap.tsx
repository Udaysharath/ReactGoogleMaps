/*Since the map was loaded on client side, 
we need to make this component client rendered as well*/
"use client";

//Map component Component from library
import { GoogleMap, InfoWindowF, MarkerF } from "@react-google-maps/api";
import React, { useCallback, useEffect, useState } from "react";
import { NextImage } from "../components/General/Next13";
import { useDebounce } from "../helper/debounce";
import { addressSearch, reverseGeocoding } from "../services/chat.service";

//Map's styling
const defaultMapContainerStyle = {
  width: "100%",
  height: "300px",
};

//Default zoom level, can be adjusted
const defaultMapZoom = 18;

//Map options
const defaultMapOptions = {
  zoomControl: false,
  tilt: 0,
  gestureHandling: "auto",
  mapTypeId: "terrain",
  fullscreenControl: false,
};

const MapComponent = ({ setLocationAllowed, locationAllowed, setMapAddress }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 500);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [searchDropdown, setSearchDropDown] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [infoWindowPosition, setInfoWindowPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [infoWindowContent, setInfoWindowContent] = useState("");

  const getGeocodingData = async (lat: any, lng: any) => {
    try {
      const reverseGeocodingData = await reverseGeocoding(lat, lng);
      const address =
        reverseGeocodingData.data[0]?.formatted_address || "Address not found";
      setMapAddress(reverseGeocodingData.data[0]);
      return address;
    } catch (error) {
      return "Error fetching address";
    }
  };
  const onMarkerDragEnd = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setInfoWindowPosition({ lat, lng });
    const address = await getGeocodingData(lat, lng);
    setInfoWindowContent(address);
  }, []);
  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          setInfoWindowPosition({ lat: latitude, lng: longitude });
          const address = await getGeocodingData(latitude, longitude);
          setInfoWindowContent(address);
        },
        (error) => {
          console.error("Error getting geolocation", error);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };
  const handleChange = (event: any) => {
    setSearchQuery(event.target.value);
    setSearchDropDown(true);
  };

  const handleSearch = async () => {
    if (debouncedValue.trim() === "") {
      setFilteredContacts([]);
      setNoResult(false);
      setSearchDropDown(false);
      return;
    }
    const searchData = await addressSearch(debouncedValue);
    if (searchData) {
      setFilteredContacts(searchData.data);
      if (searchData.data[0]?.length === 0) {
        setNoResult(true);
      }
    }
  };

  const searchClick = async (contact: any) => {
    setMarkerPosition({
      lat: contact?.geometry?.location?.lat,
      lng: contact?.geometry?.location?.lng,
    });
    setInfoWindowPosition({
      lat: contact?.geometry?.location?.lat,
      lng: contact?.geometry?.location?.lng,
    });
    const address = await getGeocodingData(
      contact?.geometry?.location?.lat,
      contact?.geometry?.location?.lng,
    );
    setInfoWindowContent(address);
    setSearchQuery("");
    setSearchDropDown(false);
  };

  useEffect(() => {
    // Check the current permission status
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        setLocationAllowed(true);
      } else if (result.state === "prompt") {
        requestLocation();
      } else {
        setLocationAllowed(false);
      }

      // Listen for changes in the permission state
      result.onchange = () => {
        if (result.state === "granted") {
          setLocationAllowed(true);
          handleClick();
        } else {
          setLocationAllowed(false);
        }
      };
    });
  }, []);

  const requestLocation = () => {
    // Request location permission
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true);
      },
      (error) => {
        setLocationAllowed(false);
      },
    );
  };

  const promptUserToAllowLocation = () => {
    if (!Boolean(locationAllowed)) {
      alert(
        "Location access is denied. Please enable location permissions in your browser settings.",
      );
    }
  };

  useEffect(() => {
    if (locationAllowed === false) {
      promptUserToAllowLocation();
    }
  }, [locationAllowed]);

  useEffect(() => {
    handleSearch();
  }, [debouncedValue]);

  useEffect(() => {
    handleClick();
  }, [mapCenter.lat, mapCenter.lng]);
  return (
    <div className="w-full">
      <section>
        <div
          style={{ border: "1px solid #ccc" }}
          className="bg-panel-header-background flex items-center gap-2  py-1 rounded-lg flex-grow"
        >
          <div className="pl-3">
            <NextImage
              src={"/static/images/addressSearch.svg"}
              alt="search-image"
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="Address Search"
              value={searchQuery}
              autoFocus={true}
              onChange={handleChange}
              className="bg-transparent text-sm focus:outline-none  w-full"
            />
          </div>
          <div
            className="pr-[5px] cursor-pointer"
            onClick={() => {
              setSearchQuery("");
            }}
          >
            <NextImage
              src={"/static/images/small-cross.svg"}
              alt="gps-image"
              className=" w-[18px] h-[18px]"
            />
          </div>
        </div>
        {Boolean(searchDropdown) ? (
          <div className=" absolute bg-[#fff] z-[999999999] mx-4 mt-[1px] overflow-y-scroll max-h-[48vh] border-1 border-black rounded-lg">
            {filteredContacts &&
              filteredContacts?.flat()?.map((contact: any, index: any) => {
                return (
                  <div
                    className="w-full flex flex-row justify-start items-start my-[10px] mx-[8px] gap-2 cursor-pointer"
                    key={index}
                    onClick={() => {
                      searchClick(contact);
                    }}
                  >
                    <div className="py-[2px] w-[25px] h-[25px]">
                      <NextImage
                        src={"/static/images/locationPinIcon.svg"}
                        alt="gps-image"
                        className=" w-[25px] h-[25px]"
                      />
                    </div>
                    <div className="flex flex-col justify-center items-start gap-[5px]">
                      <span className=" font-600 text-[14px] text-[#3c3c3c]">
                        {contact?.formatted_address.split(/,(.+)/)[0]}
                      </span>
                      <span className=" text-[12px] text-[#616161]">
                        {contact?.formatted_address.split(/,(.+)/)[1]}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <></>
        )}
      </section>
      <button
        onClick={() => {
          handleClick();
        }}
      >
        <div className=" flex flex-row justify-start items-center mx-4 my-2 gap-1">
          <NextImage src={"/static/images/myLocation.svg"} alt="gps-image" />
          <span className=" text-[#0077cc]">Use current location</span>
        </div>
      </button>
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={markerPosition ? markerPosition : mapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        <MarkerF
          position={markerPosition}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          title="marker is draggable"
        >
          <InfoWindowF
            position={infoWindowPosition}
            options={{ disableAutoPan: true }}
          >
            <div className=" flex flex-col justify-center items-center">
              <p className=" font-600 text-[#3c3c3c] text-[16px]">
                Sample will be collected here
              </p>
              <p className="text-[#616161] text-[8px]">
                Move pin to your exact location
              </p>
            </div>
          </InfoWindowF>
        </MarkerF>
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
