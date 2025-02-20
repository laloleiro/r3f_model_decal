import { HexColorPicker } from "react-colorful";
import { useSnapshot } from "valtio";
import { useState, useEffect, useRef } from "react";
import state from "../store";

const ColorPicker = ({isOpen, onClose}) => {
  const snap = useSnapshot(state);
  const pickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose(); // Call parent function to close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Hide when not active

  return (
    <div className="absolute left-full ml-3" ref={pickerRef}>
      <div className="p-2 bg-white rounded-md shadow-lg">
        <HexColorPicker 
          color={snap.color || "#ffffff"} 
          onChange={(color) => (state.color = color)} 
        />
      </div>
    </div>
  );
};

export default ColorPicker;