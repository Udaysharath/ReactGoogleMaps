import React, { useState } from "react";
import { MapProvider } from "./mapProvider";
import MapComponent from "./googleMap";
import { useSelector } from "react-redux";
import { NextImage } from "../General/Next13";

interface MapContainerProps {
  showHeaderTitle?: boolean; // Prop to control whether to show the header title or not
}

const MapContainer: React.FC<MapContainerProps> = ({}) => {
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [mapAddress, setMapAddress] = useState();


  return (
    <>
      <section className="xm:ml-[100px] Mxm:mb-[120px] mt-[65px] overflow-y-scroll">
        <div className="">
          <MapProvider>
            <MapComponent
              setLocationAllowed={setLocationAllowed}
              locationAllowed={locationAllowed}
              setMapAddress={setMapAddress}
            />
          </MapProvider>
        </div>
      </section>
      {Boolean(locationAllowed) ? (
        <div className="xm:ml-[100px] absolute z-20 bottom-[1px] Mxm:bottom-[60px] w-full bg-[#fff]">
          <div className=" mt-[5px] mb-[10px]">
            <span>Your location is set to:</span>
            <div className=" flex flex-row justify-start items-start my-[5px] gap-2">
              <div className=" py-[5px]">
                <NextImage
                  src={"/static/images/locationPinIcon.svg"}
                  alt="gps-image"
                />
              </div>
              {Boolean(mapAddress?.length !== 0) && (
                <div className="flex flex-col justify-center items-start gap-[5px] mr-2">
                  <p className=" font-600 text-[18px]">
                    {mapAddress.address_components[1].long_name}
                  </p>
                  <p className="font-300 text-[6px]">
                    {mapAddress.formatted_address}
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            className={`mb-[15px] Mxm:w-full w-[80%] flex justify-center px-[20px] py-[10px] rounded-[8px] ${"cursor-pointer bg-[#0077cc] text-[#fff]"}`}
          >
            Enter complete Address
          </button>
        </div>
      ) : (
        <div className="xm:ml-[100px] absolute z-20 bottom-[120px] Mxm:bottom-[120px] w-full bg-[#fff]">
          <p>Please allow location permissions to continue.</p>
        </div>
      )}
    </>
  );
};

export default MapContainer;
