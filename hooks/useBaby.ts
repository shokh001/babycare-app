import { BabyContext } from "@/context/BabyContext";
import { useContext } from "react";

export const useBaby = () => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error("useBaby must be used within BabyProvider");
  }
  return context;
};
