import React, { useEffect, useState } from "react";
import { MapProvider } from "./mapProvider";
import MapComponent from "../../pages/googleMap";
import { useDispatch, useSelector } from "react-redux";
import { updateIndex } from "../../store/actions/indexAction";
import { NextImage } from "../General/Next13";
import { getServiceabilityOH } from "../../services/orangeHealth.service";
import { formatDateToYYYYMMDD } from "../../helper/helperMethods";

interface MapContainerProps {
  showHeaderTitle?: boolean; // Prop to control whether to show the header title or not
}

const MapContainer: React.FC<MapContainerProps> = ({
  showHeaderTitle = true,
}) => {
  const dispatch = useDispatch();
  const [serviceableMessage, setServiceableMessage] = useState<any>("");
  const [locationAllowed, setLocationAllowed] = useState(false);
  const mapAddress =
    useSelector((state: any) => state.dashboardReducer).mapAddress || [];
  const lat = mapAddress?.geometry?.location?.lat;
  const lng = mapAddress?.geometry?.location?.lng;
  const date = formatDateToYYYYMMDD(new Date());
  const serviceable = async () => {
    try {
      const res = await getServiceabilityOH(lat, lng, date);
      setServiceableMessage(res?.data?.status);
    } catch (error) {}
  };

  useEffect(() => {
    serviceable();
  }, [lat, lng, date]);

  return (
    <>
      <section className="xm:ml-[100px] Mxm:mb-[120px] mt-[65px] overflow-y-scroll">
        <div className="">
          <MapProvider>
            <MapComponent
              setLocationAllowed={setLocationAllowed}
              locationAllowed={locationAllowed}
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
          {serviceableMessage === "" ||
            (!serviceableMessage && (
              <span className="font-300 text-[#d53333] text-3xs ml-[10px]">
                Location not serviceable!!
              </span>
            ))}
          {serviceableMessage === "Location is serviceable" && (
            <button
              className={`mb-[15px] Mxm:w-full w-[80%] flex justify-center px-[20px] py-[10px] rounded-[8px] ${"cursor-pointer bg-[#0077cc] text-[#fff]"}`}
              onClick={() => {
                dispatch(updateIndex("completeAddress"));
              }}
            >
              Enter complete Address
            </button>
          )}
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
